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
    echo "$0 getip [adobedc]"
	echo "$0 add [host] [ip]"
	echo "$0 remove [host]"
	echo "$0 update [host] [ip]"
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
  echo "update-hosts.sh must be run in the BASH shell... Aborting."; echo;
  exit 192
fi

case $1 in
getip)
    host edge.adobedc.net
   ;;
add)
	isroot

	# Do we have enough arguments?
	if [ ! $# == 3 ]; then
		echo "Missing arguments: $0 add [host] [ip]"; echo;
		exit 192
	fi

	# Does the host look valid?
	if [[ ! $2 =~ $DOMAINREGEX ]]; then
		echo "Invalid hostname: $2"; echo;
		exit 192
	fi

	# Does the IP look valid?
	if [[ ! $3 =~ $IPREGEX ]]; then
		echo "Invalid IP address: $3"; echo;
		exit 192
	fi

	# Check to see if the host is already in the file
	REGEX="$2$"
	if [ $(cat $HOSTSFILE | grep '$REGEX' | wc -l | sed 's/^ *//g') != 0 ]; then
	  echo "The host $2 is already in the hosts file."; echo;
	  exit 192
	fi

	echo -e "$3\t$2" >> $HOSTSFILE
	echo "Added $2"; echo
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
	# Do we have enough arguments?
	if [ ! $# == 3 ]; then
		echo "Missing arguments: $0 update [host] [ip]"; echo
		exit 192
	fi

	isroot

	# Does the IP look valid?
	if [[ ! $3 =~ $IPREGEX ]]; then
		echo "Invalid IP address: $3"; echo;
		exit 192
	fi

	# Does the host look valid?
	if [[ ! $2 =~ $DOMAINREGEX ]]; then
		echo "Invalid hostname: $2"; echo;
		exit 192
	fi

	backup

	$0 remove $2

	$0 add $2 $3

	echo "$2 entry updated to $3"; echo
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