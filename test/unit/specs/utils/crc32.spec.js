/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import crc32 from "../../../../src/utils/crc32.js";

const crc32Sample = {
  Sanskrit: {
    str: "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥",
    crc32Hash: 302792584,
  },
  Sanskrit_standard_transcription: {
    str: "kācaṃ śaknomyattum; nopahinasti mām.",
    crc32Hash: 192677925,
  },
  Classical_Greek: {
    str: "ὕαλον ϕαγεῖν δύναμαι· τοῦτο οὔ με βλάπτει.",
    crc32Hash: 3192255259,
  },
  Greek_monotonic: {
    str: "Μπορώ να φάω σπασμένα γυαλιά χωρίς να πάθω τίποτα.",
    crc32Hash: 979070829,
  },
  Greek_polytonic: {
    str: "Μπορῶ νὰ φάω σπασμένα γυαλιὰ χωρὶς νὰ πάθω τίποτα.",
    crc32Hash: 3154458923,
  },
  Latin: {
    str: "Vitrum edere possum; mihi non nocet.",
    crc32Hash: 2428364193,
  },
  Old_French: {
    str: "Je puis mangier del voirre. Ne me nuit.",
    crc32Hash: 766997560,
  },
  French: {
    str: "Je peux manger du verre, ça ne me fait pas mal.",
    crc32Hash: 2691810324,
  },
  Provençal_Occitan: {
    str: "Pòdi manjar de veire, me nafrariá pas.",
    crc32Hash: 1951523735,
  },
  Québécois: {
    str: "J'peux manger d'la vitre, ça m'fa pas mal.",
    crc32Hash: 2390419946,
  },
  Walloon: {
    str: "Dji pou magnî do vêre, çoula m' freut nén må.",
    crc32Hash: 636455546,
  },
  Picard: {
    str: "Ch'peux mingi du verre, cha m'foé mie n'ma.",
    crc32Hash: 2432888641,
  },
  Kreyòl_Ayisyen_Haitï: {
    str: "Mwen kap manje vè, li pa blese'm.",
    crc32Hash: 4249393419,
  },
  Basque: {
    str: "Kristala jan dezaket, ez dit minik ematen.",
    crc32Hash: 402760186,
  },
  Catalan_Català: {
    str: "Puc menjar vidre, que no em fa mal.",
    crc32Hash: 3154625029,
  },
  Spanish: {
    str: "Puedo comer vidrio, no me hace daño.",
    crc32Hash: 1723637111,
  },
  Aragonés: {
    str: "Puedo minchar beire, no me'n fa mal .",
    crc32Hash: 1505826585,
  },
  Galician: {
    str: "Eu podo xantar cristais e non cortarme.",
    crc32Hash: 1109377029,
  },
  European_Portuguese: {
    str: "Posso comer vidro, não me faz mal.",
    crc32Hash: 101185041,
  },
  Brazilian_Portuguese_8: {
    str: "Posso comer vidro, não me machuca.",
    crc32Hash: 883982287,
  },
  Caboverdiano_Kabuverdianu_Cape_Verde: {
    str: "M' podê cumê vidru, ca ta maguâ-m'.",
    crc32Hash: 4279814853,
  },
  Papiamentu: {
    str: "Ami por kome glas anto e no ta hasimi daño.",
    crc32Hash: 2084937203,
  },
  Italian: {
    str: "Posso mangiare il vetro e non mi fa male.",
    crc32Hash: 3047854232,
  },
  Milanese: {
    str: "Sôn bôn de magnà el véder, el me fa minga mal.",
    crc32Hash: 2168316945,
  },
  Roman: {
    str: "Me posso magna' er vetro, e nun me fa male.",
    crc32Hash: 1559137374,
  },
  Napoletano: {
    str: "M' pozz magna' o'vetr, e nun m' fa mal.",
    crc32Hash: 502573463,
  },
  Venetian: {
    str: "Mi posso magnare el vetro, no'l me fa mae.",
    crc32Hash: 616338953,
  },
  Zeneise_Genovese: {
    str: "Pòsso mangiâ o veddro e o no me fà mâ.",
    crc32Hash: 28085942,
  },
  Sicilian: {
    str: "Puotsu mangiari u vitru, nun mi fa mali.",
    crc32Hash: 1960166993,
  },
  Romansch_Grischun: {
    str: "Jau sai mangiar vaider, senza che quai fa donn a mai.",
    crc32Hash: 515085501,
  },
  Romanian: {
    str: "Pot să mănânc sticlă și ea nu mă rănește.",
    crc32Hash: 1879348622,
  },
  Esperanto: {
    str: "Mi povas manĝi vitron, ĝi ne damaĝas min.",
    crc32Hash: 2514278986,
  },
  Cornish: {
    str: "Mý a yl dybry gwéder hag éf ny wra ow ankenya.",
    crc32Hash: 14991194,
  },
  Welsh: {
    str: "Dw i'n gallu bwyta gwydr, 'dyw e ddim yn gwneud dolur i mi.",
    crc32Hash: 1548251343,
  },
  Manx_Gaelic: {
    str: "Foddym gee glonney agh cha jean eh gortaghey mee.",
    crc32Hash: 1378983096,
  },
  Old_Irish_Ogham: {
    str: "᚛᚛ᚉᚑᚅᚔᚉᚉᚔᚋ ᚔᚈᚔ ᚍᚂᚐᚅᚑ ᚅᚔᚋᚌᚓᚅᚐ᚜",
    crc32Hash: 2248868407,
  },
  Old_Irish_Latin: {
    str: "Con·iccim ithi nglano. Ním·géna.",
    crc32Hash: 864598796,
  },
  Irish: {
    str: "Is féidir liom gloinne a ithe. Ní dhéanann sí dochar ar bith dom.",
    crc32Hash: 709577166,
  },
  Ulster_Gaelic: {
    str: "Ithim-sa gloine agus ní miste damh é.",
    crc32Hash: 1206756846,
  },
  Scottish_Gaelic: {
    str: "S urrainn dhomh gloinne ithe; cha ghoirtich i mi.",
    crc32Hash: 3064191386,
  },
  "Anglo-Saxon_Runes": {
    str: "ᛁᚳ᛫ᛗᚨᚷ᛫ᚷᛚᚨᛋ᛫ᛖᚩᛏᚪᚾ᛫ᚩᚾᛞ᛫ᚻᛁᛏ᛫ᚾᛖ᛫ᚻᛖᚪᚱᛗᛁᚪᚧ᛫ᛗᛖ᛬",
    crc32Hash: 2170250096,
  },
  "Anglo-Saxon_Latin": {
    str: "Ic mæg glæs eotan ond hit ne hearmiað me.",
    crc32Hash: 2974948093,
  },
  Middle_English: {
    str: "Ich canne glas eten and hit hirtiþ me nouȝt.",
    crc32Hash: 2519549262,
  },
  English: {
    str: "I can eat glass and it doesn't hurt me.",
    crc32Hash: 3522513655,
  },
  English_IPA: {
    str: "[aɪ kæn iːt glɑːs ænd ɪt dɐz nɒt hɜːt miː] (Received Pronunciation)",
    crc32Hash: 2272956447,
  },
  English_Braille: {
    str: "⠊⠀⠉⠁⠝⠀⠑⠁⠞⠀⠛⠇⠁⠎⠎⠀⠁⠝⠙⠀⠊⠞⠀⠙⠕⠑⠎⠝⠞⠀⠓⠥⠗⠞⠀⠍⠑",
    crc32Hash: 3787140422,
  },
  Jamaican: {
    str: "Mi kian niam glas han i neba hot mi.",
    crc32Hash: 443133101,
  },
  Lalland_Scots_Doric: {
    str: "Ah can eat gless, it disnae hurt us.",
    crc32Hash: 747768810,
  },
  Gothic_4: {
    str: "ЌЌЌ ЌЌЌЍ Ќ̈ЍЌЌ, ЌЌ ЌЌЍ ЍЌ ЌЌЌЌ ЌЍЌЌЌЌЌ.",
    crc32Hash: 3686804294,
  },
  Old_Norse_Runes: {
    str: "ᛖᚴ ᚷᛖᛏ ᛖᛏᛁ ᚧ ᚷᛚᛖᚱ ᛘᚾ ᚦᛖᛋᛋ ᚨᚧ ᚡᛖ ᚱᚧᚨ ᛋᚨᚱ",
    crc32Hash: 2108429530,
  },
  Old_Norse_Latin: {
    str: "Ek get etið gler án þess að verða sár.",
    crc32Hash: 296353268,
  },
  Norsk_Norwegian_Nynorsk: {
    str: "Eg kan eta glas utan å skada meg.",
    crc32Hash: 1577959981,
  },
  Norsk_Norwegian_Bokmål: {
    str: "Jeg kan spise glass uten å skade meg.",
    crc32Hash: 2766158238,
  },
  Føroyskt_Faroese: {
    str: "Eg kann eta glas, skaðaleysur.",
    crc32Hash: 1761767164,
  },
  Íslenska_Icelandic: {
    str: "Ég get etið gler án þess að meiða mig.",
    crc32Hash: 964197683,
  },
  Svenska_Swedish: {
    str: "Jag kan äta glas utan att skada mig.",
    crc32Hash: 2676580541,
  },
  Dansk_Danish: {
    str: "Jeg kan spise glas, det gør ikke ondt på mig.",
    crc32Hash: 1496560676,
  },
  Sønderjysk: {
    str: "Æ ka æe glass uhen at det go mæ naue.",
    crc32Hash: 1426070144,
  },
  Frysk_Frisian: {
    str: "Ik kin glês ite, it docht me net sear.",
    crc32Hash: 1849595261,
  },
  Nederlands_Dutch: {
    str: "Ik kan glas eten, het doet mĳ geen kwaad.",
    crc32Hash: 4016747965,
  },
  Kirchröadsj_Bôchesserplat: {
    str: "Iech ken glaas èèse, mer 't deet miech jing pieng.",
    crc32Hash: 611147726,
  },
  Afrikaans: {
    str: "Ek kan glas eet, maar dit doen my nie skade nie.",
    crc32Hash: 2665435467,
  },
  Lëtzebuergescht_Luxemburgish: {
    str: "Ech kan Glas iessen, daat deet mir nët wei.",
    crc32Hash: 2414621007,
  },
  Deutsch_German: {
    str: "Ich kann Glas essen, ohne mir zu schaden.",
    crc32Hash: 326341728,
  },
  Ruhrdeutsch: {
    str: "Ich kann Glas verkasematuckeln, ohne dattet mich wat jucken tut.",
    crc32Hash: 390997622,
  },
  Langenfelder_Platt: {
    str: "Isch kann Jlaas kimmeln, uuhne datt mich datt weh dääd.",
    crc32Hash: 172048332,
  },
  'Lausitzer_Mundart_"Lusatian"': {
    str: "Ich koann Gloos assn und doas dudd merr ni wii.",
    crc32Hash: 3814582543,
  },
  Odenwälderisch: {
    str: "Iech konn glaasch voschbachteln ohne dass es mir ebbs daun doun dud.",
    crc32Hash: 3690429996,
  },
  Sächsisch_Saxon: {
    str: "'sch kann Glos essn, ohne dass'sch mer wehtue.",
    crc32Hash: 1553361449,
  },
  Pfälzisch: {
    str: "Isch konn Glass fresse ohne dasses mer ebbes ausmache dud.",
    crc32Hash: 2890933716,
  },
  Schwäbisch_Swabian: {
    str: "I kå Glas frässa, ond des macht mr nix!",
    crc32Hash: 2705198893,
  },
  Deutsch_Voralberg: {
    str: "I ka glas eassa, ohne dass mar weh tuat.",
    crc32Hash: 1802390038,
  },
  Bayrisch_Bavarian: {
    str: "I koh Glos esa, und es duard ma ned wei.",
    crc32Hash: 1620844699,
  },
  Allemannisch: {
    str: "I kaun Gloos essen, es tuat ma ned weh.",
    crc32Hash: 532444931,
  },
  Schwyzerdütsch_Zürich: {
    str: "Ich chan Glaas ässe, das schadt mir nöd.",
    crc32Hash: 647555846,
  },
  Schwyzerdütsch_Luzern: {
    str: "Ech cha Glâs ässe, das schadt mer ned.",
    crc32Hash: 2888870414,
  },
  Hungarian: {
    str: "Meg tudom enni az üveget, nem lesz tőle bajom.",
    crc32Hash: 798141029,
  },
  Suomi_Finnish: {
    str: "Voin syödä lasia, se ei vahingoita minua.",
    crc32Hash: 854800956,
  },
  Sami_Northern: {
    str: "Sáhtán borrat lása, dat ii leat bávččas.",
    crc32Hash: 2134369501,
  },
  Erzian: {
    str: "Мон ярсан суликадо, ды зыян эйстэнзэ а ули.",
    crc32Hash: 1195119622,
  },
  Northern_Karelian: {
    str: "Mie voin syvvä lasie ta minla ei ole kipie.",
    crc32Hash: 825590056,
  },
  Southern_Karelian: {
    str: "Minä voin syvvä st'oklua dai minule ei ole kibie.",
    crc32Hash: 1454844737,
  },
  Estonian: {
    str: "Ma võin klaasi süüa, see ei tee mulle midagi.",
    crc32Hash: 1872139873,
  },
  Latvian: {
    str: "Es varu ēst stiklu, tas man nekaitē.",
    crc32Hash: 1984101272,
  },
  Lithuanian: {
    str: "Aš galiu valgyti stiklą ir jis manęs nežeidžia",
    crc32Hash: 462644696,
  },
  Czech: {
    str: "Mohu jíst sklo, neublíží mi.",
    crc32Hash: 1941463124,
  },
  Slovak: {
    str: "Môžem jesť sklo. Nezraní ma.",
    crc32Hash: 1401582521,
  },
  Polska_Polish: {
    str: "Mogę jeść szkło i mi nie szkodzi.",
    crc32Hash: 4062381321,
  },
  Slovenian: {
    str: "Lahko jem steklo, ne da bi mi škodovalo.",
    crc32Hash: 3517115573,
  },
  "Bosnian,_Croatian,_Montenegrin_and_Serbian_Latin": {
    str: "Ja mogu jesti staklo, i to mi ne šteti.",
    crc32Hash: 526455862,
  },
  "Bosnian,_Montenegrin_and_Serbian_Cyrillic": {
    str: "Ја могу јести стакло, и то ми не штети.",
    crc32Hash: 1697709634,
  },
  Macedonian: {
    str: "Можам да јадам стакло, а не ме штета.",
    crc32Hash: 1164576497,
  },
  Russian: {
    str: "Я могу есть стекло, оно мне не вредит.",
    crc32Hash: 3819750153,
  },
  Belarusian_Cyrillic: {
    str: "Я магу есці шкло, яно мне не шкодзіць.",
    crc32Hash: 4029978467,
  },
  Belarusian_Lacinka: {
    str: "Ja mahu jeści škło, jano mne ne škodzić.",
    crc32Hash: 1627307525,
  },
  Ukrainian: {
    str: "Я можу їсти скло, і воно мені не зашкодить.",
    crc32Hash: 752793683,
  },
  Bulgarian: {
    str: "Мога да ям стъкло, то не ми вреди.",
    crc32Hash: 3841600447,
  },
  Georgian: {
    str: "მინას ვჭამ და არა მტკივა.",
    crc32Hash: 3209020393,
  },
  Armenian: {
    str: "Կրնամ ապակի ուտել և ինծի անհանգիստ չըներ։",
    crc32Hash: 344432805,
  },
  Albanian: {
    str: "Unë mund të ha qelq dhe nuk më gjen gjë.",
    crc32Hash: 541809055,
  },
  Turkish: {
    str: "Cam yiyebilirim, bana zararı dokunmaz.",
    crc32Hash: 3446658794,
  },
  Turkish_Ottoman: {
    str: "جام ييه بلورم بڭا ضررى طوقونمز",
    crc32Hash: 7569123,
  },
  Bangla_Bengali: {
    str: "আমি কাঁচ খেতে পারি, তাতে আমার কোনো ক্ষতি হয় না।",
    crc32Hash: 3121877246,
  },
  Marathi: {
    str: "मी काच खाऊ शकतो, मला ते दुखत नाही.",
    crc32Hash: 2262144017,
  },
  Kannada: {
    str: "ನನಗೆ ಹಾನಿ ಆಗದೆ, ನಾನು ಗಜನ್ನು ತಿನಬಹುದು",
    crc32Hash: 3783527408,
  },
  Hindi: {
    str: "मैं काँच खा सकता हूँ और मुझे उससे कोई चोट नहीं पहुंचती.",
    crc32Hash: 911621671,
  },
  Tamil: {
    str: "நான் கண்ணாடி சாப்பிடுவேன், அதனால் எனக்கு ஒரு கேடும் வராது.",
    crc32Hash: 2492793518,
  },
  Telugu: {
    str: "నేను గాజు తినగలను మరియు అలా చేసినా నాకు ఏమి ఇబ్బంది లేదు",
    crc32Hash: 1475959036,
  },
  Sinhalese: {
    str: "මට වීදුරු කෑමට හැකියි. එයින් මට කිසි හානියක් සිදු නොවේ.",
    crc32Hash: 2353063362,
  },
  Urdu3: {
    str: "میں کانچ کھا سکتا ہوں اور مجھے تکلیف نہیں ہوتی ۔",
    crc32Hash: 2416692885,
  },
  Pashto3: {
    str: "زه شيشه خوړلې شم، هغه ما نه خوږوي",
    crc32Hash: 2167742720,
  },
  Farsi_Persian3: {
    str: ".من می توانم بدونِ احساس درد شيشه بخورم",
    crc32Hash: 367406354,
  },
  Arabic3: {
    str: "أنا قادر على أكل الزجاج و هذا لا يؤلمني.",
    crc32Hash: 2614809933,
  },
  Maltese: {
    str: "Nista' niekol il-ħġieġ u ma jagħmilli xejn.",
    crc32Hash: 1075553078,
  },
  Hebrew3: {
    str: "אני יכול לאכול זכוכית וזה לא מזיק לי.",
    crc32Hash: 611298455,
  },
  Yiddish3: {
    str: "איך קען עסן גלאָז און עס טוט מיר נישט װײ.",
    crc32Hash: 1278369850,
  },
  Twi: {
    str: "Metumi awe tumpan, ɜnyɜ me hwee.",
    crc32Hash: 1882519302,
  },
  Hausa_Latin: {
    str: "Inā iya taunar gilāshi kuma in gamā lāfiyā.",
    crc32Hash: 3951714594,
  },
  Hausa_Ajami_2: {
    str: "إِنا إِىَ تَونَر غِلَاشِ كُمَ إِن غَمَا لَافِىَا",
    crc32Hash: 2165839937,
  },
  Yoruba4: {
    str: "Mo lè je̩ dígí, kò ní pa mí lára.",
    crc32Hash: 462513830,
  },
  Lingala: {
    str: "Nakokí kolíya biténi bya milungi, ekosála ngáí mabé tɛ́.",
    crc32Hash: 3326201453,
  },
  KiSwahili: {
    str: "Naweza kula bilauri na sikunyui.",
    crc32Hash: 1166963539,
  },
  Malay: {
    str: "Saya boleh makan kaca dan ia tidak mencederakan saya.",
    crc32Hash: 1655550062,
  },
  Tagalog: {
    str: "Kaya kong kumain nang bubog at hindi ako masaktan.",
    crc32Hash: 2604200406,
  },
  Chamorro: {
    str: "Siña yo' chumocho krestat, ti ha na'lalamen yo'.",
    crc32Hash: 2067473716,
  },
  Fijian: {
    str: "Au rawa ni kana iloilo, ia au sega ni vakacacani kina.",
    crc32Hash: 4067250732,
  },
  Javanese: {
    str: "Aku isa mangan beling tanpa lara.",
    crc32Hash: 2987633961,
  },
  Burmese: {
    str: "က္ယ္ဝန္‌တော္‌၊က္ယ္ဝန္‌မ မ္ယက္‌စားနုိင္‌သည္‌။ ၎က္ရောင္‌့ ထိခုိက္‌မ္ဟု မရ္ဟိပာ။ (9)",
    crc32Hash: 699725753,
  },
  Vietnamese_quốc_ngữ: {
    str: "Tôi có thể ăn thủy tinh mà không hại gì.",
    crc32Hash: 2565707606,
  },
  Vietnamese_nôm_4: {
    str: "些 ࣎ 世 咹 水 晶 ও 空 ࣎ 害 咦",
    crc32Hash: 1216417303,
  },
  Khmer: {
    str: "ខ្ញុំអាចញុំកញ្ចក់បាន ដោយគ្មានបញ្ហារ",
    crc32Hash: 2350771137,
  },
  Lao: {
    str: "ຂອ້ຍກິນແກ້ວໄດ້ໂດຍທີ່ມັນບໍ່ໄດ້ເຮັດໃຫ້ຂອ້ຍເຈັບ.",
    crc32Hash: 1733276636,
  },
  Thai: {
    str: "ฉันกินกระจกได้ แต่มันไม่ทำให้ฉันเจ็บ",
    crc32Hash: 227782237,
  },
  Mongolian_Cyrillic: {
    str: "Би шил идэй чадна, надад хортой биш",
    crc32Hash: 2254455591,
  },
  Mongolian_Classic_5: {
    str: "ᠪᠢ ᠰᠢᠯᠢ ᠢᠳᠡᠶᠦ ᠴᠢᠳᠠᠨᠠ ᠂ ᠨᠠᠳᠤᠷ ᠬᠣᠤᠷᠠᠳᠠᠢ ᠪᠢᠰᠢ",
    crc32Hash: 412025584,
  },
  Nepali: {
    str: "म काँच खान सक्छू र मलाई केहि नी हुन्‍न् ।",
    crc32Hash: 92247149,
  },
  Tibetan: {
    str: "ཤེལ་སྒོ་ཟ་ནས་ང་ན་གི་མ་རེད།",
    crc32Hash: 2943025548,
  },
  Chinese: {
    str: "我能吞下玻璃而不伤身体。",
    crc32Hash: 3340264501,
  },
  Chinese_Traditional: {
    str: "我能吞下玻璃而不傷身體。",
    crc32Hash: 617692142,
  },
  Taiwanese6: {
    str: "Góa ē-tàng chia̍h po-lê, mā bē tio̍h-siong.",
    crc32Hash: 3845385888,
  },
  Japanese: {
    str: "私はガラスを食べられます。それは私を傷つけません。",
    crc32Hash: 1060378668,
  },
  Korean: {
    str: "나는 유리를 먹을 수 있어요. 그래도 아프지 않아요",
    crc32Hash: 3701809983,
  },
  Bislama: {
    str: "Mi save kakae glas, hemi no save katem mi.",
    crc32Hash: 1105523983,
  },
  Hawaiian: {
    str: "Hiki iaʻu ke ʻai i ke aniani; ʻaʻole nō lā au e ʻeha.",
    crc32Hash: 3890531562,
  },
  Marquesan: {
    str: "E koʻana e kai i te karahi, mea ʻā, ʻaʻe hauhau.",
    crc32Hash: 1236763367,
  },
  Inuktitut_10: {
    str: "ᐊᓕᒍᖅ ᓂᕆᔭᕌᖓᒃᑯ ᓱᕋᙱᑦᑐᓐᓇᖅᑐᖓ",
    crc32Hash: 557265846,
  },
  Chinook_Jargon: {
    str: "Naika məkmək kakshət labutay, pi weyk ukuk munk-sik nay.",
    crc32Hash: 4059264750,
  },
  Navajo: {
    str: "Tsésǫʼ yishą́ągo bííníshghah dóó doo shił neezgai da.",
    crc32Hash: 3770336662,
  },
  Lojban: {
    str: "mi kakne le nu citka le blaci .iku'i le se go'i na xrani mi",
    crc32Hash: 3008094941,
  },
  Nórdicg: {
    str: "Ljœr ye caudran créneþ ý jor cẃran.",
    crc32Hash: 4211638728,
  },
};

describe("crc32", () => {
  it("should hash a string and return a number ", () => {
    const str = "hello";
    const result = crc32(str);
    expect(typeof result).toBe("number");
    expect(result).toEqual(907060870);
  });

  it("should create same hash every time", () => {
    const idsTohash = {
      email: {
        id: "me@me.com",
        authState: 0,
      },
    };
    const resultOne = crc32(JSON.stringify(idsTohash));
    const resultTwo = crc32(JSON.stringify(idsTohash));
    expect(typeof resultOne).toBe("number");
    expect(resultOne).toBe(3158443042);
    expect(resultTwo).toBe(3158443042);
  });

  it("should always return a positive number", () => {
    const idOneTohash = "x+x";
    const idTwoTohash = "a*b/100-220";
    const resultOne = crc32(JSON.stringify(idOneTohash));
    const resultTwo = crc32(JSON.stringify(idTwoTohash));
    expect(typeof resultOne).toBe("number");
    expect(resultOne).toBeGreaterThan(0);
    expect(typeof resultTwo).toBe("number");
    expect(resultTwo).toBeGreaterThan(0);
  });

  it("should hash strings with special characters", () => {
    const stringToHash = "hello@#&^hq10";
    const result = crc32(stringToHash);
    expect(result).toBe(864118309);
  });

  it("should create different hashes for different strings", () => {
    const stringOneToHash = "hello@#&^hq10";
    const stringTwoToHash = "hello@#&h^q10";
    const resultOne = crc32(stringOneToHash);
    const resultTwo = crc32(stringTwoToHash);
    expect(resultOne).not.toEqual(resultTwo);
    expect(resultOne).toBe(864118309);
    expect(resultTwo).toBe(3365964926);
  });

  describe("hashing of various of unicode chars", () => {
    Object.keys(crc32Sample).forEach((lang) => {
      const sample = crc32Sample[lang];
      it(`should create right hash of a ${lang} string`, () => {
        expect(crc32(sample.str)).toBe(sample.crc32Hash);
      });
    });
  });
});
