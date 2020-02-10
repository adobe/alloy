#!/bin/bash

HOSTSFILE="/etc/hosts"
BAKFILE="$HOSTSFILE.bak"
DOMAINREGEX="^[a-zA-Z0-9]{1}[a-zA-Z0-9\.\-]+$"
IPREGEX="^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$"
URLREGEX="^https?:\/\/[a-zA-Z0-9]{1}[a-zA-Z0-9\/\.\-]+$"

backup()
{
  echo "Backup created at $BAKFILE";
	cat $HOSTSFILE > $BAKFILE
}

usage()
{
	echo "Usage:"
    echo "$0 start [adobedc]"
	echo "$0 remove [host]"
	echo "$0 update [host]"
	echo "$0 check [host]"
	echo "$0 rollback (reverts the last change)"
	echo "$0 import [file or url] [--append] (replaces or appends the host file with the new one)"
	echo
}

isroot()
{
	# Check for root user
	if [ $(whoami) != "root" ]; then
	  echo "$0 must be run as root... Aborting."; echo;
	  exit 192
	fi
}

# Check that we're in a BASH shell
if test -z "$BASH" ; then
  echo "proxy.sh must be run in the BASH shell... Aborting."; echo;
  exit 192
fi

case $1 in
start)
	isroot
	LOCALHOST="127.0.0.1"
	LOCALALLOY="localalloy.com"
	FIRSTPARTYALLOY="firstparty.localalloy.com"

	EDGEIP=$(host edge.adobedc.net | awk '/has address/ { print $4; exit }')
	echo $EDGEIP;
	if [[ ! $EDGEIP =~ $IPREGEX ]]; then
		echo "Invalid IP address: $EDGEIP"; echo;
		exit 192
	fi

	if [ $(cat $HOSTSFILE | grep $LOCALALLOY | wc -l | sed 's/^ *//g') != 0 ]; then
	  echo "The host $LOCALALLOY is already in the hosts file."; echo;
	  exit 192
	fi

	if [ $(cat $HOSTSFILE | grep $FIRSTPARTYALLOY | wc -l | sed 's/^ *//g') != 0 ]; then
	  echo "The host $FIRSTPARTYALLOY is already in the hosts file."; echo;
	  exit 192
	fi

	echo -e "$LOCALHOST\t$LOCALALLOY" >> $HOSTSFILE
	echo -e "$EDGEIP\t$FIRSTPARTYALLOY" >> $HOSTSFILE
	echo "Added $LOCALALLOY & $FIRSTPARTYALLOY"; echo
   ;;
check)
	# Do we have enough arguments?
	if [ ! $# == 2 ]; then
		echo "Missing arguments: $0 check [host]"; echo
		exit 192
	fi

	REGEX="${2}$"; 
	if [ $(cat $HOSTSFILE | grep $REGEX | wc -l | sed 's/^ *//g') != 0 ];
		then
	  		cat $HOSTSFILE | grep $2
		else
			echo "The host $2 was not found in the host file."; echo;
	fi

	;;
remove)
	# Do we have enough arguments?
	if [ ! $# == 2 ]; then
		echo "Missing arguments: $0 remove [host]"; echo
		exit 192
	fi

	isroot

	REGEX="$2$"
	if [ $(cat $HOSTSFILE | grep $REGEX | wc -l | sed 's/^ *//g') = 0 ]; then
		echo "The host $2 was not found in the host file."; echo;
		exit 0;
	fi

	backup

	cat $HOSTSFILE | sed -e "/$2$/ d" > tmp && mv tmp $HOSTSFILE
	echo "$2 entry removed."; echo
	;;
update)
	isroot

	FIRSTPARTYALLOY="firstparty.localalloy.com"
	EDGEIP=$(host edge.adobedc.net | awk '/has address/ { print $4; exit }')
	echo $EDGEIP;
	
	if [[ ! $EDGEIP =~ $IPREGEX ]]; then
		echo "Invalid IP address: $EDGEIP"; echo;
		exit 192
	fi

	# Does the IP look valid?
	if [[ ! $EDGEIP =~ $IPREGEX ]]; then
		echo "Invalid IP address: $3"; echo;
		exit 192
	fi
	
	$0 remove $FIRSTPARTYALLOY

	# $0 add $EDGEIP $FIRSTPARTYALLOY
	echo -e "$EDGEIP\t$FIRSTPARTYALLOY" >> $HOSTSFILE
	echo "$FIRSTPARTYALLOY entry updated to $EDGEIP"; echo
	;;
import)
	TEMPFILE="./hostsimport.$(date +%s).tmp"
	APPEND=0

	# Do we have enough arguments?
	if [ ! $# -gt 1 ]; then
		echo "Missing arguments: $0 import [file] {--append}"; echo
		exit 192
	fi

	isroot

	if [ ! -z $3 ]; then
		if [ $3 == "--append" ]; then
			APPEND=1
		fi
	fi

	# Check the file type and fetch it if needed.
	
	if [[ $2 =~ $URLREGEX ]]
		then
			echo "curl -s -o $TEMPFILE $2"
		else
			TEMPFILE=$2
	fi

	if [ -f $TEMPFILE ]; 
		then
			backup

			IMPORTPREFIX="\n\n## IMPORTED FROM: $2\n\n";

			if [ $APPEND == 0 ]
				then
					echo -e "$(head -n 11 $HOSTSFILE)$(echo $IMPORTPREFIX)$(cat $TEMPFILE)" > $HOSTSFILE
					echo "$2 has been imported in to $HOSTSFILE."; 
				else
					echo -e $IMPORTPREFIX >> $HOSTSFILE
					cat $TEMPFILE >> $HOSTSFILE
					echo "$2 has been appended on to $HOSTSFILE."; 
			fi
		else
			echo "Invalid import file."
	fi

	echo
	;;
export)
	# Do we have enough arguments?
	if [ ! $# == 2 ]; then
		echo "Missing arguments: $0 export [outfile]"; echo
		exit 192
	fi

	isroot

	cat $HOSTSFILE > $2

	echo "Current $HOSTFILE saved to $2"

	;;
rollback)
	isroot

	if [ -f $BAKFILE ]
		then
			cat $BAKFILE > $HOSTSFILE
			rm $BAKFILE
			echo "Rollback complete."; echo
		else
			echo "No backup file found!"; echo
	fi
	;;
-h)
	usage
	;;
*)
	echo "Missing command. Type $0 -h for usage."; echo
	;;
esac
exit 0