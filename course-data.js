// Course content derived from the video transcript (Whisper) and slide frames.
// Question helpers: mc = single choice, ms = multi-select, fb = fill-in-the-blank.
// `t` = video timestamp (seconds) where the answer is discussed.
const mc = (q, opts, ans, why, t, id) => ({ type: 'mc', q, opts, ans, why, t });
const ms = (q, opts, ans, why, t) => ({ type: 'ms', q, opts, ans, why, t });
const fb = (q, accepted, why, t) => ({ type: 'fb', q, accepted, why, t });

window.COURSE = {
  title: 'Automotive Cybersecurity: a Self-Study Course',
  speaker: 'Based on the conference talk "Car Hacking Masterclass" by Kamel Ghali (founder of MocoConnect; vice president of international operations at Car Hacking Village)',
  videoClips: 'video/',   // per-module clips: video/m1.mp4 + video/m1.vtt (captions)
  videoUrl: '',           // optional: a public YouTube/Drive/https link used only if videoClips is empty
  disclaimer: 'This course summarises a conference talk by Kamel Ghali. Prices, timelines, statistics and how companies behave are the speaker\'s own claims and opinions and have not been independently verified. Company names appear only where the speaker used them as examples; they are not statements about those companies\' practices. Quiz answers test what the speaker said, not established fact. The labs are simulations or paper exercises: only test vehicles or systems you own or have written authorisation to test.',
  glossary: [['OEM','Original equipment manufacturer: the brand on the car'],['ECU','Electronic control unit: an embedded computer in a vehicle'],['CAN','Controller Area Network: the in-vehicle bus with no sender field and no authentication'],['X-by-wire','Steering, throttle or braking controlled by network messages instead of mechanical links'],['VIN','Vehicle identification number'],['CSMS','Cybersecurity Management System: the organisation-wide lifecycle capability UN R155 requires'],['TARA','Threat Analysis and Risk Assessment (popularised by ISO/SAE 21434)'],['OTA','Over-the-air software update'],['IDS/IPS','Intrusion detection / prevention system'],['CTF','Capture the flag: a hacking competition'],['SAST / DAST','Static / dynamic application security testing'],['PKI','Public key infrastructure: certificates and keys used to authenticate software and devices'],['NDA','Non-disclosure agreement'],['auto-ISAC','The automotive information sharing and analysis centre for threat intelligence'],['DEF','Diesel exhaust fluid, sprayed into truck exhaust to reduce emissions'],['UN R155','UN regulation on cybersecurity and cybersecurity management systems for vehicles']],
  pass: 0.8,
  perQuiz: 8,
  finalCount: 20,
  digest: [
    'Cars went from "boxes with wheels" to networked computers: electronic control units (ECUs) on a Controller Area Network (CAN) bus, roughly 200-300 million lines of code (speaker\'s estimate), cellular, Wi-Fi and Bluetooth, and X-by-wire control.',
    'The industry paid little attention to cybersecurity until the 2015 Jeep hack, and then largely until regulation required it: UN R155 (adopted 2020 per the speaker\'s timeline slide), with ISO/SAE 21434 as the technical guide.',
    'Compliance means a Cybersecurity Management System (CSMS): an organisation-wide lifecycle capability covering risk analysis, penetration testing, security operations, incident response and updates, not a single product.',
    'Risk is rated on attack feasibility and impact (safety, financial, operational, privacy) in a Threat Analysis and Risk Assessment (TARA), and each rating must map to a pre-agreed risk response.',
    'Many original equipment manufacturers (OEMs) outsource much of their testing and assessments. The speaker gives rough prices (single-ECU penetration test about $30k or more, full vehicle about $200k) and names communities where researchers and buyers meet.'
  ],
  modules: [
    {
      id: 1, title: 'Cars became computers', range: [154, 403],
      objectives: ['State why manufacturers adopted a bus topology', 'Define an ECU and list three functions ECUs control', 'List the connectivity features that widened the attack surface'],
      notes: `
<p><b>Original purpose:</b> move you from A to B safely, quickly and comfortably. Then convenience tech arrived: GPS/navigation, Bluetooth music, Wi-Fi hotspots for passengers, cameras, LiDAR, long-range cellular, and self-driving/robo-taxis.</p>
<p><b>Vehicle networks:</b> instead of a fully populated point-to-point mesh between microcontrollers, manufacturers adopted a <b>bus topology</b>, cutting roughly <b>70-80% of the wiring</b> (lighter, cheaper, more reliable).</p>
<p><b>ECU (electronic control unit):</b> a processing unit plus I/O and networking that controls part of the vehicle and communicates its status to other parts. Powertrain ECUs handle throttle, braking, steering and so on.</p>
<p><b>Result:</b> "a bunch of computers on wheels". The speaker believes an average modern vehicle runs about <b>200-300 million lines of code</b>, and that complexity brought a large volume of vulnerabilities.</p>`,
      lab: {
        type: 'can',
        title: 'Lab: Talk to a (simulated) CAN bus',
        intro: 'This simulated Controller Area Network (CAN) bus runs entirely in your browser; nothing touches a real vehicle or network. You act as a node plugged onto the bus. Complete the three tasks, then answer the reflection question.'
      },
      quiz: [
        mc('According to the speaker, why did manufacturers move to a bus network topology inside vehicles?', ['It encrypts all messages by default', 'It cut roughly 70-80% of the wiring (the speaker\'s figure)', 'It allowed every ECU to talk directly to the cloud', 'Regulators required it'], 1, 'The speaker said bus topologies replaced point-to-point meshes and cut maybe 70-80% of the wiring.', 240),
        mc('Which of these did the speaker NOT list as technology added to modern vehicles?', ['Cameras and LiDAR', 'Long-range cellular networking', 'A Wi-Fi hotspot using the manufacturer\'s cellular subscription', 'Satellite broadband internet'], 3, 'Cameras, LiDAR, cellular and Wi-Fi hotspots were all mentioned; satellite broadband was not.', 265),
        mc('What is an ECU?', ['A cloud service that manages vehicle updates', 'A part of the car with a processing unit, I/O and networking that controls the vehicle and communicates its status to other parts', 'A type of tyre pressure sensor', 'The key fob radio'], 1, 'ECU = electronic control unit: processing + I/O + networking, in charge of controlling part of the vehicle.', 345),
        mc('Which functions are controlled by powertrain ECUs, per the talk?', ['Radio presets only', 'Throttle, braking and steering', 'Only seat heating', 'Only the dashboard display'], 1, 'He mentioned several ECUs in the powertrain system responsible for moving the car: throttle, braking, steering.', 365),
        fb('Per the speaker, an average modern vehicle runs roughly 200-300 ____ lines of code.', ['million','millions'], 'He estimated two to three hundred million lines ("I believe"); treat it as an estimate.', 340),
        ms('Select all the features the speaker gave as examples of technology added to cars over time.', ['Pairing a phone over Bluetooth to play music', 'GPS / navigation', 'A Wi-Fi hotspot for passengers', 'Hydraulic power steering'], [0, 1, 2], 'Navigation, Bluetooth phone streaming and the Wi-Fi hotspot were listed. Hydraulic power steering was not.', 205),
        mc('What did the speaker identify as the driving force behind many advances in vehicle networking and connectivity?', ['Military requirements', 'User-facing convenience technology', 'Insurance companies', 'Fuel regulations'], 1, 'He called user-facing convenience technology the driving force.', 300),
        mc('How does the speaker summarise what a car has become?', ['A mobile network operator', 'A bunch of computers on wheels', 'A sealed appliance with no software', 'A simple mechanical system'], 1, '"What used to be a big metal cage... is now a bunch of computers on wheels."', 330),
        mc('What did vehicle complexity and software volume introduce, according to the speaker?', ['Fewer bugs because of safety testing', 'A large volume of vulnerabilities', 'No security impact', 'Mandatory encryption'], 1, 'He said the complexity and amount of software introduced a large volume of vulnerabilities.', 335),
        mc('What did the older point-to-point approach look like, compared with a bus?', ['A fully populated mesh of connections between microcontrollers', 'A single wireless link', 'A ring of fibre optics', 'No networking at all'], 0, 'He contrasted a "fully populated mesh" of point-to-point connections with a bus topology.', 233)
      ]
    },
    {
      id: 2, title: 'Why people hack cars, and the kill chain', range: [403, 690],
      objectives: ['Classify a given motive as hobbyist, emissions circumvention or malicious', 'Define X-by-wire and explain why it raises the stakes', 'List the kill-chain steps in the order the speaker gives'],
      notes: `
<p><b>Chip tuning:</b> reverse engineering ECU firmware, modifying it, and reflashing it. It began with hobbyists wanting better fuel performance, removed speed/RPM limits or a different dashboard, and is a huge community worldwide.</p>
<p><b>Nefarious side - emissions circumvention:</b> heavy-duty diesel trucks must use a DEF fluid tank to cut exhaust emissions. Some illegal services modify the control-module firmware so the truck no longer needs it. The speaker says a fleet can save millions per year and that the practice is hard to police.</p>
<p><b>The risk side:</b> a 2-ton vehicle with people inside + wireless interfaces (cellular, Bluetooth, Wi-Fi, wireless tyre pressure) + millions of lines of code + third-party software + nobody really checking.</p>
<p><b>X-by-wire:</b> steering, throttle or braking is controlled by network traffic. Messages on the bus directly affect vehicle operation, which is how self-driving cars actuate the car.</p>
<p><b>Kill chain</b> (the speaker's simple framing; steps 2-4 are in the order he lists them): (1) get inside via an external interface → (2) remote code execution, privilege escalation → (3) pivot to other parts of the vehicle → (4) exert your will: control the car, eavesdrop (e.g. steering-wheel microphone), ransomware.</p>`,
      lab: {
        type: 'order',
        title: 'Lab: Put the car hacking kill chain in order',
        intro: 'Use the arrows to arrange these steps, in the order the speaker describes them.',
        items: [
          { t: 'Find an external interface and get access to the vehicle', why: 'Step 1: "get inside".' },
          { t: 'Execute code remotely and escalate privileges', why: 'Step 2: leverage once inside.' },
          { t: 'Pivot to other parts of the vehicle', why: 'Step 3: move laterally to reach critical systems.' },
          { t: 'Exert your will: control the car, eavesdrop, or ransomware it', why: 'Step 4: the payoff.' }
        ]
      },
      quiz: [
        mc('What is chip tuning?', ['Replacing tires with performance tires', 'Reverse engineering ECU firmware, modifying it, and reflashing it to the car', 'Calibrating the key fob radio', 'Testing semiconductor wafers'], 1, 'He described reverse engineering ECU firmware, modifying it and reflashing it.', 440),
        mc('Which was NOT an original hobbyist motive for modifying ECUs?', ['Improve fuel performance', 'Remove speed or RPM limitations', 'Change how the dashboard looked', 'Reduce engine noise'], 3, 'The hobbyist motives were performance, limit removal and personalisation.', 415),
        mc('What is the additive sprayed into heavy-truck exhaust for?', ['Lubricating the engine', 'It is sprayed into the exhaust to reduce harmful emissions', 'Cooling the transmission', 'Cleaning the windshield'], 1, 'It chemically reacts with exhaust to reduce emissions, and trucks may not legally drive otherwise.', 485),
        mc('According to the speaker, why do some fleet operators pay for modified control-module firmware that removes the emissions-fluid requirement?', ['It is required by regulators', 'They save on the fluid and improve performance, potentially millions per year (the speaker\'s claim; he calls the practice illegal)', 'It improves safety', 'It increases warranty coverage'], 1, 'He said fleets can save millions per year; he describes the practice as illegal and hard to police.', 556),
        mc('What is an X-by-wire system?', ['A wireless charging pad', 'Steering, throttle or braking is controlled by network traffic', 'A satellite radio feature', 'A type of fuse box'], 1, 'Messages on the bus directly impact vehicle operation; this underlies autonomy and driver assist.', 592),
        mc('What is step 1 of the car hacking kill chain?', ['Escalate privileges', 'Exert your will on the vehicle', 'Find an external interface and get access to the vehicle', 'Perform a TARA'], 2, 'Step one: get inside, find an external interface, get access.', 655),
        fb('Heavy diesel trucks use a fluid abbreviated ____ to cut exhaust emissions.', ['def','diesel exhaust fluid'], 'DEF is sprayed into the exhaust to reduce harmful emissions.', 485),
        ms('Which are examples the speaker gave of "exerting your will" on a vehicle?', ['Controlling the vehicle', 'Eavesdropping through a microphone in the steering wheel', 'Ransomwaring the vehicle', 'Issuing a recall'], [0, 1, 2], 'Control, eavesdropping and ransomware were all mentioned; issuing a recall is something a manufacturer does.', 668),
        mc('Who does the speaker say builds many of these systems and interfaces?', ['Dedicated red teams', 'Engineers focused on safety, efficiency and low-cost supply chains rather than security (the speaker\'s view)', 'Government agencies', 'Independent researchers'], 1, 'The speaker\'s view: many of these systems were built by engineers working to safety, efficiency and low-cost supply-chain goals rather than as security specialists.', 638),
        mc('Which wireless interfaces did he list as now present on cars?', ['Cellular, Bluetooth, Wi-Fi, wireless tyre pressure monitoring', 'Only Bluetooth', 'Only AM/FM radio', 'None; vehicles are fully wired'], 0, 'He listed cellular networks, Bluetooth, Wi-Fi, wireless tyre pressure monitoring.', 565),
        mc('A 2-ton vehicle + people inside + wireless interfaces + millions of lines of code + little independent security checking illustrates…', ['Why cars are safe', 'Why the attack surface and stakes are so high', 'Why fuel economy improved', 'Why insurance is cheap'], 1, 'This is the "what could possibly go wrong" slide.', 580)
      ]
    },
    {
      id: 3, title: 'OEMs, hackers and the supply chain pyramid', range: [690, 900],
      objectives: ['Contrast OEM and hacker goals and explain "two sides of one coin"', 'Place OEMs, suppliers and sub-suppliers in the supply-chain pyramid', 'State which party holds final responsibility for vehicle cybersecurity'],
      notes: `
<p><b>OEM goal:</b> a secure vehicle: secure software/network architecture, careful software version selection, standards and best practices, isolation of critical vs non-safety networks, penetration testing, and secure PKI in production.</p>
<p><b>Hackers:</b> some want to damage or steal (criminal intent), but many just want to look at electronics and modify them - including a <b>right-to-repair</b> consumer-rights angle. The industry is motivated to <b>pay security researchers</b> with hacking experience to help build more secure vehicles: two sides of the same coin.</p>
<p><b>Supply chain pyramid:</b> maybe 50-60 car brands you know, but behind each is roughly 10-20 suppliers. In the speaker's example, behind Toyota is Denso (the speaker says maybe 60-70% of components; unverified), which in turn buys from Renesas, Infineon and others who supply software and hardware.</p>
<p><b>Responsibility:</b> the <b>OEM</b> (the brand on the car) has final responsibility for the vehicle and its cybersecurity under most legislation. Long development cycles, plus compliance activities, make everything slower. It is also a niche industry, only about ten years old.</p>`,
      lab: {
        type: 'classify',
        title: 'Lab: Place each company or role in the supply pyramid',
        intro: 'Choose the correct level for each item (as used in the talk).',
        options: ['OEM (brand on the car)', 'Supplier (e.g. Denso level)', 'Sub-supplier (chips / components)'],
        items: [
          { t: 'Toyota (the speaker\'s example)', a: 0, why: 'The brand/OEM: logo on the vehicle, final responsibility.' },
          { t: 'Denso (the speaker\'s example)', a: 1, why: 'A huge supplier making a large share of components for Toyota.' },
          { t: 'Renesas', a: 2, why: 'Supplies hardware/software to Denso-level suppliers.' },
          { t: 'Infineon', a: 2, why: 'Same as Renesas in the speaker\'s example.' },
          { t: 'Whoever holds final responsibility for a vehicle\'s cybersecurity under most legislation', a: 0, why: 'Components flow up to the OEM, whose brand is on the car and who carries the final responsibility.' }
        ]
      },
      quiz: [
        mc('What is the OEM\'s objective regarding security?', ['Hire a red team for every department', 'Make a secure vehicle', 'Avoid all regulation', 'Remove all connectivity'], 1, '"The OEM\'s objective is to make a secure vehicle."', 722),
        mc('Why does the speaker call car hackers and the security industry "two sides of the same coin"?', ['They are the same people', 'The industry is motivated to pay hackers\' experience to make vehicles more secure', 'Hackers write standards', 'Both oppose legislation'], 1, 'The security industry wants to pay hackers experienced with embedded systems.', 786),
        mc('What angle of the hacker community does "right to repair" represent?', ['A criminal angle', 'A consumer-rights angle', 'A military angle', 'A marketing angle'], 1, 'He called right to repair a big part of the consumer rights angle.', 774),
        mc('Roughly how many suppliers sit behind each car brand, per the speaker?', ['One or two', '10 to 20', 'Around 1,000', 'None; OEMs build everything'], 1, '"For every brand... there\'s maybe 10 to 20 suppliers in a huge supply chain."', 823),
        mc('In the speaker\'s supply-chain example, which supplier sits behind Toyota?', ['Denso', 'A regional dealer group', 'A cloud provider', 'A regulator'], 0, 'Denso, which he said makes maybe 60-70% of components in Toyota vehicles.', 862),
        mc('Who has final responsibility for the vehicle and its cybersecurity under most legislation?', ['The semiconductor vendor', 'The OEM', 'The customer', 'The regulator'], 1, 'The OEM, according to most legislation around the world.', 890),
        ms('Select all OEM security design activities the speaker listed.', ['Secure in-vehicle network design with isolation of critical vs non-safety networks', 'Penetration testing', 'Producing in a secure way with secure PKI', 'Removing all speed limiters'], [0, 1, 2], 'Speed limiter removal is a hobbyist tuning motive, not an OEM security activity.', 750),
        mc('How old does the speaker say the automotive cybersecurity industry is?', ['About 2 years', 'About 10 years', 'About 50 years', 'About 100 years'], 1, '"It\'s only really been around for about 10 or so years."', 905),
        mc('Why are automotive development cycles long?', ['Cars are simple', 'Complex development, plus legislation and compliance activities add more', 'No testing is required', 'Software is bought off the shelf'], 1, 'He said legislation and compliance make cycles even longer.', 900),
        fb('OEM stands for original equipment ____.', ['manufacturer', 'manufacturers'], 'The OEM puts its logo on the vehicle.', 855),
        mc('Which statement fits the pyramid?', ['Brand names are at the base and suppliers on top', 'The OEM is at the top; each level buys from suppliers beneath', 'There is no hierarchy', 'Chip vendors sell directly to consumers'], 1, 'Components flow up to the OEM at the top.', 880)
      ]
    },
    {
      id: 4, title: 'Timeline: CAN, the Jeep hack and the speaker\'s "gold rush"', range: [900, 1240],
      objectives: ['Explain why CAN was considered "safe enough" by the industry', 'Describe the 2015 Jeep hack and why the speaker calls it "ground zero"', 'Explain why OEMs invested only when regulation required it'],
      notes: `
<p><b>Key takeaway:</b> security was ignored until a public remote attack in 2015, and then until the law required investment.</p>
<ul>
<li><b>Prehistoric era (CAN bus, from the 1980s):</b> CAN has <b>no source address, no destination, no encryption and no authentication</b>. The industry's stance was that it is a wired network, so an attacker needs physical access, and at that point they are already inside the car.</li>
<li><b>Ground zero, 21 July 2015, the Jeep hack:</b> two researchers spent about two years studying the Uconnect system and its cloud. In the speaker's account they could remotely stop the engine of a Jeep Cherokee knowing only the vehicle identification number (VIN). They used responsible disclosure: the manufacturer fixed the issues before publication, and the researchers were not under NDA.</li>
<li><b>The gold rush:</b> companies rushed to sell in-vehicle intrusion detection and prevention systems (IDS/IPS), but, in the speaker's words, no one really knew what they were doing, and OEMs were slow to buy.</li>
<li><b>No compulsion to invest:</b> the speaker recalls an OEM contact (2017-2018) saying they would not invest in cybersecurity until a law required it.</li>
<li><b>Why safety and security differ:</b> functional safety is largely "do it once and it is done"; cybersecurity is dynamic, with new vulnerabilities and attack patterns found every day.</li>
</ul>
<p><b>Timeline slide:</b> Prehistoric era, Jeep hack (2015), gold rush, UN R155 adopted (24 June 2020, per the slide), standards and stabilisation, present day (Pwn2Own Automotive), unknown future. The speaker stresses this is his own perception, not an official timeline.</p>`,
      lab: {
        type: 'order',
        title: 'Lab: Rebuild the timeline',
        intro: 'Order these events from earliest to latest.',
        items: [
          { t: 'CAN bus appears in vehicles; researchers note no source/destination/encryption/authentication', why: '1980s, the "prehistoric era" (the speaker\'s label).' },
          { t: 'Jeep hack - 21 July 2015 ("ground zero")', why: 'Brought automotive security into the public eye.' },
          { t: 'Gold rush: IDS/IPS products for in-vehicle networks; some OEMs say they will not invest until the law requires it', why: 'Roughly 2017-2018 in the speaker\'s story.' },
          { t: 'UN R155 adopted - 24 June 2020 (per the timeline slide)', why: 'Regulation creates mandatory motivation.' },
          { t: 'Pwn2Own Automotive competitions in Tokyo - present day', why: 'Researchers are rewarded for responsibly disclosing vulnerabilities.' }
        ]
      },
      quiz: [
        mc('Which weaknesses of CAN did researchers highlight?', ['No source address, no destination, no encryption, no authentication', 'Only a slow data rate', 'Too much encryption overhead', 'It is wireless'], 0, 'This is the core "prehistoric era" observation.', 940),
        mc('According to the speaker, what was the industry\'s attitude to CAN\'s lack of security?', ['It is dangerous and must be redesigned', 'It is a wired network, so an attacker needs physical access, and at that point they are already inside the car', 'Encryption was planned for next year', 'Regulators already handled it'], 1, 'That was the prevailing stance until 2015.', 960),
        mc('Which date does the speaker call "ground zero" for the automotive cybersecurity industry?', ['June 24, 2020', 'July 21, 2015', 'January 1, 2000', 'May 3, 2010'], 1, 'The 2015 Jeep demonstration showed vehicles could be attacked remotely, which is why the speaker treats it as the start of the industry.', 983),
        mc('According to the speaker\'s account, what did the Jeep researchers need to know to attack a vehicle remotely?', ['Its VIN', 'Its owner\'s password', 'Physical access to the OBD port', 'Its Wi-Fi password'], 0, '"All they needed to know was the vehicle\'s VIN."', 1036),
        mc('Roughly how long did the researchers spend studying the system?', ['A weekend', 'A few weeks', 'About two years', 'A decade'], 2, 'He said about two years of reverse engineering.', 1016),
        mc('How did the Jeep researchers handle disclosure?', ['Sold the bugs to criminals', 'Responsible disclosure: they informed the manufacturer, and the flaws were fixed before publication', 'They never published', 'They published first and informed the vendor later'], 1, 'Responsible (coordinated) disclosure gives the vendor time to fix an issue before details are public.', 1066),
        mc('According to the speaker, what did the "gold rush" after the Jeep hack consist of?', ['Mass recalls', 'Companies building in-vehicle IDS/IPS and other solutions without much understanding of what worked', 'Open-sourcing of all ECUs', 'A ban on connected cars'], 1, '"No one really knew what they were doing."', 1087),
        mc('What did one OEM contact tell the speaker, per the talk?', ['They already had cybersecurity fully covered', 'They would not invest in it until a regulation required it', 'They wanted to see the source code first', 'They planned to acquire the speaker\'s company'], 1, 'With no legal motivation there was no investment, which is why the speaker sees regulation as the turning point.', 1166),
        mc('Why is cybersecurity different from functional safety in the speaker\'s view?', ['Safety is dynamic; security is once and done', 'Safety testing is largely done once, while cybersecurity is dynamic with new vulnerabilities and attacks found every day', 'They are identical', 'Security needs no testing'], 1, 'This is why a one-and-done mindset fails for security.', 1190),
        mc('Which is the correct order of the first phases on the speaker\'s timeline slide?', ['Gold rush, then the prehistoric era, then the Jeep hack', 'The prehistoric era, then the Jeep hack, then the gold rush', 'Standards, then the Jeep hack, then CAN is invented', 'The Jeep hack, then the prehistoric era, then UN R155'], 1, 'As presented on the timeline slide.', 940),
        mc('How does the speaker describe the status of his timeline?', ['An official published timeline', 'His own personal perception', 'A UN document', 'An ISO standard'], 1, 'The slide says it is based on his own personal perception.', 925),
        fb('The speaker calls the period before the Jeep hack the "____ era".', ['prehistoric'], 'He labels the early CAN years the prehistoric era.', 944)
      ]
    },
    {
      id: 5, title: 'Regulations and standards', range: [1240, 1560],
      objectives: ['Match each regulation or standard to its main requirement', 'Define type approval and give one example of national variation', 'Identify the source of buying pressure for security services'],
      notes: `
<p><b>UN R155</b> (adopted 24 June 2020, per the timeline slide): a binding UN regulation adopted by <b>63 countries</b> (the slide lists the EU, UK, Japan and South Korea). Two main components: implement a <b>Cybersecurity Management System (CSMS)</b> and obtain <b>type approval</b> for each <i>vehicle type</i> (Japanese: Katashiki Ninsho) before selling in adopting countries.</p>
<p>In practice it differs per country; the speaker says the UN text isn't directly enforceable and countries adopt it into their own law. For example, Japan adds a clause that all vehicle traffic logs must be kept for <b>six months</b> for forensics.</p>
<p><b>ISO/SAE 21434:</b> SAE = Society of Automotive Engineers; ISO = International Organization for Standardization (the speaker says "International Standards group"). A global technical guide on how to do vehicle cybersecurity: not very detailed, <b>not legally binding</b> (per the slide), developed in parallel with R155; R155 defers to it for hands-on technical aspects.</p>
<p><b>China GB 44495-2024:</b> similar to R155 with specific requirements such as <b>auditable OTA updates</b> and offline updates to prevent unauthorised modification. The speaker also said India had very recently passed its own legislation ("I think").</p>
<p>The speaker's thesis: <b>regulation and standards are where much of the buying pressure comes from.</b> Adoption timing varies, since markets with older vehicles come later.</p>`,
      lab: {
        type: 'classify',
        title: 'Lab: Which regulation or standard is this?',
        intro: 'Match each description to the regulation or standard.',
        options: ['UN R155', 'ISO/SAE 21434', 'China GB 44495-2024', 'Japan\'s national version of R155'],
        items: [
          { t: 'Requires a CSMS and type approval for each vehicle type', a: 0, why: 'The two core components of R155.' },
          { t: 'A global technical guide to vehicle cybersecurity; not legally binding', a: 1, why: 'And R155 defers to it for technical detail.' },
          { t: 'Requires auditable OTA and offline updates', a: 2, why: 'China-specific requirement.' },
          { t: 'Adds a requirement to keep vehicle traffic logs for six months', a: 3, why: 'A country-specific clause on top of the UN base text.' },
          { t: 'Popularised the TARA method, per the speaker (threat analysis and risk assessment)', a: 1, why: 'The speaker says TARA was popularised by ISO/SAE 21434.' }
        ]
      },
      quiz: [
        mc('What are the two main components required by UN R155?', ['Annual audits and public bug bounties', 'A cybersecurity management system and type approval per vehicle type', 'Mandatory encryption and mandatory OTA', 'Penetration test every month'], 1, 'R155 requires both: the CSMS proves the organisation\'s processes, and type approval proves each vehicle type. The audit covers the process, not only the product.', 1330),
        mc('How many countries does the speaker say have adopted UN R155?', ['6', '23', '63', '193'], 2, '63 countries (as on the slide and in speech).', 1320),
        mc('What is "type approval"?', ['Approval of each individual car by the buyer', 'Certification of a vehicle type by the governing body before it can be sold in adopting countries', 'A typing test for engineers', 'An insurance product'], 1, 'In Japanese: Katashiki Ninsho. Without it the vehicle type cannot be sold in adopting countries.', 1350),
        mc('What did the speaker say about how R155 is applied across countries?', ['It is identical everywhere', 'The base tenets are common but it looks different per country, e.g. Japan adds a country-specific log-retention clause', 'Only the EU enforces it', 'It bans OTA'], 1, 'Countries adopt the UN text into their own law, so details such as log retention vary.', 1400),
        mc('Which of these is TRUE about ISO/SAE 21434?', ['It is a legally binding UN law', 'It is a global technical guide, not very detailed, that works hand in hand with R155', 'It only applies to China', 'It replaced TARA'], 1, 'R155 defers to it for hands-on technical aspects.', 1420),
        fb('Japan\'s version of the rules requires vehicle traffic logs to be kept for ____ months.', ['six','6'], 'A Japan-specific clause added for forensic purposes.', 1400),
        mc('Which standard does the talk associate with auditable OTA updates and offline updates?', ['GB 44495-2024 (China)', 'ISO 9001', 'UN R155 only', 'None'], 0, 'China\'s standard has those specific requirements.', 1465),
        mc('According to the speaker, which country had recently passed its own automotive cybersecurity law (as of the talk)?', ['India', 'Brazil', 'Canada', 'Australia'], 0, 'He said India very recently passed its own.', 1485),
        mc('Where does the speaker say much of the "buying pressure" for security services comes from?', ['Customer demand', 'Legislation and standards', 'Social media', 'Insurance discounts'], 1, 'He emphasised this on the way into the regulation slide.', 1297),
        mc('Why were some countries slower to adopt, according to the speaker?', ['They ban software', 'Their vehicles are often one or two generations behind in technology', 'They have no roads', 'They lack engineers'], 1, 'E.g. much of Southeast Asia.', 1510),
        mc('Do these rules cover only the finished vehicle?', ['Yes, only the finished vehicle', 'No: they also cover the organisation\'s processes through development, production and operation', 'Only if the OEM chooses', 'Only for electric vehicles'], 1, 'This is the CSMS idea: lifecycle processes, not just a product.', 1580)
      ]
    },
    {
      id: 6, title: 'CSMS and TARA: managing cyber risk end to end', range: [1560, 2200],
      objectives: ['State what a CSMS must demonstrate', 'Name the two TARA dimensions and the four common impact categories', 'Rate a scenario on a risk matrix and choose one of the four risk responses'],
      notes: `
<p><b>Key takeaway:</b> a CSMS is an organisation-wide, lifecycle capability; a TARA is how it quantifies risk, and every rating must map to a pre-agreed response.</p>
<ul>
<li><b>CSMS</b> (Cybersecurity Management System) is not a single technical solution. It demonstrates that the organisation understands the cyber risks to its products and has lifecycle processes (development, operation, retirement): threat assessment, penetration testing, incident response, vulnerability disclosure and a remediation strategy. It is technical <i>and</i> organisational.</li>
<li><b>The speaker's end-to-end model</b> (his own, not official): development (software and hardware security activities, bills of materials per the slide) leads to a TARA, then penetration testing and a test report. Operation covers security operations, threat intelligence (he names auto-ISAC, dark-web forums and subreddits), triage and validation, incident response, responsible disclosure, and updates, which loop back into development like a figure eight.</li>
<li><b>A penetration test (pen test) and the TARA interact:</b> if a three-week penetration test compromises a unit you rated very low probability, go back and update the TARA.</li>
<li><b>TARA = Threat Analysis and Risk Assessment</b>, popularised by ISO/SAE 21434: threat modelling plus impact quantification. Two dimensions: <b>attack feasibility</b> and <b>impact</b>.</li>
<li><b>Impact categories:</b> the most common four are <b>safety, financial, operational, privacy</b>. The speaker has seen one client add <b>reputation</b> and <b>cybersecurity</b> (could an attack pivot into backend or corporate IT?), discussed again around 50:05-51:30.</li>
<li><b>Process:</b> threat scenario, attack tree, damage scenarios, impact per category, then a risk value on the matrix. Safety usually has its <b>own, stricter matrix</b>: higher risk even at lower feasibility. Organisations define the impact criteria in advance. On the speaker's damage-scenario slide the levels run Severe, Moderate, Minor, Negligible; his examples of severe are life-threatening injury or loss of control, and a loss big enough to bankrupt the company.</li>
<li><b>Risk response</b> (a playbook decided ahead of time): accept, remediate, transfer, or remove (for example, drop a feature). One remediation he gives: require AES-256 where encryption is needed.</li>
<li><b>Lifespan:</b> vehicles operate for 10-15 years, so security updates and incident-response reviews (at least yearly, depending on policy) must continue until retirement.</li>
</ul>`,
      lab: {
        type: 'tara',
        title: 'Lab: Run a mini-TARA',
        intro: 'Choose the dominant impact level, the attack feasibility and a risk response. The app looks the risk up on an illustrative 4x4 matrix; safety scenarios add one level, because the speaker says safety gets a stricter matrix. Each organisation defines its own criteria; this matrix is for practice only.',
        scenarios: [
          { name: 'Jeep-style remote kill: a cloud/head-unit flaw lets an attacker stop engines over the internet using only the VIN.', cat: 'Safety', impact: 3, feas: 3, resp: [1, 3], why: 'Severe safety impact and high (remote, trivial) feasibility → top risk. Remediate, or remove the exposure.' },
          { name: 'Key-fob replay on a model without rolling codes, enabling vehicle theft.', cat: 'Financial', impact: 2, feas: 3, resp: [1, 2], why: 'Moderate financial impact, easy to do → high risk. Remediate (rolling codes) or transfer (insurance).' },
          { name: 'Diagnostic link uses an old cipher with a short key, but exploiting it needs physical access and lab equipment.', cat: 'Privacy', impact: 2, feas: 1, okRisk: [1, 2], okFeas: [0, 1], resp: [0, 1], why: 'Moderate impact but low feasibility → low risk. Accept or remediate (e.g. require AES-256).' },
          { name: 'Infotainment Wi-Fi flaw allows pivoting into the manufacturer\'s backend/corporate IT network.', cat: 'Cybersecurity', impact: 3, feas: 2, resp: [1, 3], why: 'This is the extra "cybersecurity" impact category: severe impact, medium feasibility → high risk. Remediate.' },
          { name: 'Cosmetic dashboard theme can be changed, but only after dismantling the instrument cluster.', cat: 'Operational', impact: 0, feas: 0, resp: [0], why: 'Negligible impact and very low feasibility → minimal risk. Accept.' }
        ]
      },
      quiz: [
        mc('What does a CSMS demonstrate?', ['A single encryption product', 'That the organisation understands cyber risks and has lifecycle processes to manage them, from development through operation to retirement', 'That the vehicle has no vulnerabilities', 'That ISO 9001 was passed'], 1, 'It is not one technical solution; it is processes and organisation.', 1590),
        mc('What does TARA stand for?', ['Technical Attack and Recovery Analysis', 'Threat Analysis and Risk Assessment', 'Total Automotive Risk Audit', 'Testing and Reporting Automation'], 1, 'Popularised by ISO/SAE 21434.', 1700),
        fb('The two dimensions of a TARA risk rating are impact and attack ____.', ['feasibility','probability'], 'Feasibility (or probability) of the attack, plus the impact if the damage scenario is realised.', 1720),
        mc('Which pair of dimensions rates a TARA scenario?', ['Cost and schedule', 'Attack feasibility and impact', 'Safety and security', 'Cost and effort'], 1, 'He said TARA quantifies risk in two dimensions: feasibility (probability) of the attack and its impact.', 1990),
        mc('Which are the four most common impact categories mentioned?', ['Safety, financial, operational, privacy', 'Safety, reliability, cost, comfort', 'Safety, legal, social, technical', 'Financial, legal, reputational, technical'], 0, 'Plus optional extras such as reputation and cybersecurity.', 2000),
        ms('Select the extra impact categories one client used beyond the standard four.', ['Reputation', 'Cybersecurity (spread into backend / corporate IT)', 'Fuel economy', 'Warranty cost'], [0, 1], 'The talk describes reputation and cybersecurity as client-specific extras (discussed again at about 50:05).', 3005),
        mc('A 3-week pen test fully compromises a unit that the TARA rated very low probability. What should you do?', ['Ignore it', 'Go back, re-analyse and update the TARA', 'Delete the pen test report', 'Raise the price'], 1, 'The pen test may invalidate the risk assessment.', 1770),
        mc('Why does the speaker say safety usually gets a separate risk matrix?', ['It is cheaper', 'Safety risk is potentially life-harming, so higher risk values apply even at lower feasibility', 'Regulators forbid combining', 'Safety is not important'], 1, 'Same feasibility, higher impact → more red.', 2095),
        ms('Which are the risk responses named by the speaker?', ['Accept', 'Remediate', 'Transfer', 'Remove (e.g. drop a feature)', 'Ignore until an incident occurs'], [0, 1, 2, 3], 'He said you need a risk response playbook set up ahead of time.', 2125),
        mc('Why must security activities in the operation phase continue for years?', ['Vehicles are operated about 10-15 years, so the OEM must support security until retirement', 'Customers renew every year', 'Laws require annual recalls', 'Because tests are cheap'], 0, 'He compared a phone (about 1-4 years) with a car (10-15).', 1860),
        mc('How often does he suggest reviewing incident response procedures at minimum?', ['Every 10 years', 'Once a year or so, depending on the policy', 'Never', 'Daily'], 1, '"At minimum like once a year or something."', 1895),
      ]
    },
    {
      id: 7, title: 'The market: outsourcing, pricing and who buys', range: [2200, 3270],
      objectives: ['Explain why OEMs outsource testing', 'State the speaker\'s rough price and duration ranges for each engagement type', 'Contrast the speaker\'s view of newer EV makers with traditional OEMs'],
      notes: `
<p><b>Key takeaway:</b> testing is often outsourced, prices scale with scope, and the buyer may be an OEM or a supplier. All figures are the speaker's rough, unverified estimates.</p>
<ul>
<li><b>Why outsource:</b> OEMs have hundreds of departments, each with its own budget and cybersecurity activities. One in-house red team cannot serve them all, and one per department is excessive, so work goes to consultants and third parties.</li>
<li><b>Who the client is:</b> sometimes the OEM, sometimes a <b>supplier</b> whose customer requires a penetration test (pen test), SAST or DAST (static and dynamic application security testing) as a deliverable. Within one OEM, the onboard (ECU and wireless) team and the cloud, mobile and API team are separate clients with different timelines. Entering the bidding process is hard.</li>
<li><b>Rough prices (very general, scope-dependent):</b> risk assessment, maybe plus a penetration test, about <b>$20k-$60k</b>; one system or ECU penetration test about <b>$30k or a bit more</b>; a whole vehicle maybe <b>$200k</b>.</li>
<li><b>Rough durations:</b> whole-vehicle black-box test about <b>three weeks to a month</b>; a teardown with destructive testing and firmware extraction <b>two months or more</b>. Scope drives man-hours, skills and the proposal.</li>
<li><b>The "fear factor":</b> the speaker says it matters little at the sales stage now: the law has been in place for about three to four years, and major OEMs already invest. Under an NDA you are also not threatening to go public.</li>
<li><b>Attitudes (speaker's generalisation):</b> newer EV makers tend to be more open to outside researchers, with invitations, private bug bashes and bounties; some traditional OEMs lean towards compliance-driven security.</li>
</ul>`,
      lab: {
        type: 'classify',
        title: 'Lab: Match each engagement to price or duration',
        intro: 'Using the speaker\'s rough estimates (unverified), match each engagement to its approximate price or duration.',
        options: ['A range of $20k-$60k (assessment-scale work)', 'An average of about $30k (a single ECU)', 'About $200k (whole vehicle)', 'Three weeks to a month', 'Two months or more'],
        items: [
          { t: 'The speaker\'s average for a penetration test of a single ECU or system', a: 1, why: 'He said average maybe $30,000, maybe a bit more.' },
          { t: 'A risk assessment (possibly with a penetration test) for a feature such as unlocking from a phone: the range he quotes', a: 0, why: 'About $20k-$60k depending on scope.' },
          { t: 'The PRICE the speaker gives for a penetration test of an entire vehicle', a: 2, why: 'Maybe $200,000, depending on delivery length.' },
          { t: 'The DURATION for a black-box whole-vehicle assessment (no documents, no source)', a: 3, why: 'He estimated three weeks to a month.' },
          { t: 'The DURATION for a full teardown: removing panels and ECUs, extracting firmware', a: 4, why: 'Two months or more.' }
        ]
      },
      quiz: [
        mc('According to the speaker, why do many OEMs outsource red-team style work?', ['They lack money', 'They have hundreds of departments with separate budgets, so one red team cannot serve them all and one per department is excessive', 'Regulation forbids in-house teams', 'No talent exists'], 1, 'So a lot goes to consultants and third parties.', 2230),
        mc('What range did the speaker give for a risk assessment (possibly with a pen test)?', ['$200-$600', '$2,000-$6,000', '$20,000-$60,000', '$2M-$6M'], 2, 'Highly scope-dependent; this is his rough estimate.', 2415),
        mc('Roughly what did he give for a single ECU/system pen test?', ['$3,000', '$30,000 or a bit more', '$300,000', '$3 million'], 1, '"Average price maybe $30,000 US, maybe a little bit more."', 2441),
        mc('Roughly what did he give for a whole-vehicle pen test?', ['$2,000', '$20,000', '$200,000', '$20 million'], 2, '"Maybe $200,000 for a whole vehicle."', 2447),
        mc('According to the speaker\'s rough estimate, how long might a black-box whole-vehicle assessment take?', ['Three days', 'Three weeks to a month', 'Six months', 'One year'], 1, 'He said maybe three weeks to a month.', 2509),
        mc('According to the speaker, roughly how long might a full teardown with destructive testing and firmware extraction take?', ['One day', 'Two months or more', 'Always one week', 'Exactly three weeks'], 1, '"A two month or more process."', 2551),
        mc('Why might you be hired by a supplier rather than an OEM?', ['Suppliers have more money', 'The supplier\'s OEM customer requires a pen test/SAST/DAST as part of the deliverable', 'Suppliers are forbidden to test', 'OEMs never hire'], 1, 'He described suppliers submitting test reports to their client.', 2705),
        mc('Why does he say onboard and cloud/mobile/API teams within one OEM should be treated as separate clients?', ['Different branding', 'They have different timelines, projects and types of work, and often do not share information', 'They use the same budget', 'They are legally separate'], 1, 'Each team is effectively a separate client.', 2885),
        mc('Per the speaker, why isn\'t the "fear factor" very valuable at the sales stage now?', ['Hacks no longer happen', 'The law has been in place for ~3-4 years and major OEMs already invest to some degree; under NDA you are not going to go public', 'Fear-based selling is banned by the regulation', 'Brands do not care about reputation'], 1, 'It mattered back when no law forced investment.', 2950),
        mc('According to the speaker, in the speaker\'s experience, how do some newer EV makers treat outside security researchers?', ['They refuse all external reports', 'They work with researchers, for example through invitations and bounties', 'They rely only on internal staff', 'They require a court order first'], 1, 'This is the speaker\'s own experience and generalisation, not independently verified.', 3230)
      ]
    },
    {
      id: 8, title: 'Community, the Jeep write-up and next steps', range: [3270, 3856],
      objectives: ['Match each community or event to its description', 'Explain why the speaker recommends reading the Jeep researchers\' write-up', 'Name two ways to get noticed by people in the industry'],
      notes: `
<p><b>Key takeaway:</b> the free Jeep write-up and a handful of communities and events are where you learn the field and meet the people in it.</p>
<ul>
<li><b>The Jeep write-up</b> (also watch 43:03-44:35): the researchers published a very detailed, <b>free</b> account of what they did. The speaker says it is essential reading: the problems were <b>architectural</b> as well as code bugs (cloud connectivity, no network segmentation between the vehicle and other networks).</li>
<li><b>Car Hacking Village (CHV):</b> a non-profit that runs hands-on workshops, talks and a capture-the-flag (CTF) competition at events such as DEF CON and Code Blue (Japan). The speaker says a car has been given away as a prize at least twice.</li>
<li><b>Automotive Security Research Group (ASRG):</b> another non-profit, volunteer-run with local chapters.</li>
<li><b>Pwn2Own Automotive:</b> held in Tokyo every January, and OEMs send people. The speaker said the 2027 event had not been announced and guessed the announcement would come in September.</li>
<li><b>Private bug bashes:</b> some OEMs invite researchers, cover travel and accommodation, and run private bounty events.</li>
<li><b>His advice:</b> go where the community and the industry gather, and be collaborative rather than protective of contacts.</li>
</ul>`,
      lab: {
        type: 'classify',
        title: 'Lab: Where do you find them?',
        intro: 'Match each description to the community or event named in the talk.',
        options: ['Car Hacking Village', 'ASRG', 'Pwn2Own Automotive', 'Private bug bash (client-hosted)'],
        items: [
          { t: 'Takes place in Tokyo every January; OEMs send people to watch', a: 2, why: 'He said it was a great place to meet manufacturers.' },
          { t: 'Non-profit that runs hands-on workshops, talks and a CTF competition', a: 0, why: 'The speaker is its VP of international operations.' },
          { t: 'Volunteer, member-run, local chapters (he co-founded Detroit)', a: 1, why: 'Automotive Security Research Group.' },
          { t: 'An invite where the client pays for flights, hotel and food while you hunt for bugs', a: 3, why: 'Private bug bounty event, e.g. his trip to Italy.' },
          { t: 'Has given away a car as a CTF prize at least twice, per the speaker', a: 0, why: 'As a CTF prize.' }
        ]
      },
      quiz: [
        mc('What does the speaker recommend you read to learn vehicle security lessons?', ['A vendor white paper', 'The Jeep researchers\' detailed free write-up', 'A textbook on electronics', 'Nothing'], 1, 'He says every lesson can be learned from it.', 2625),
        mc('Besides code flaws, what kinds of problems did the Jeep paper show?', ['Only typos', 'Architectural problems such as no network segmentation and cloud connectivity', 'Only physical damage', 'None'], 1, 'It was the whole system design, not just bugs.', 2640),
        mc('Which organisation is the speaker\'s volunteer, non-profit activity?', ['Car Hacking Village', 'Denso', 'ISO', 'UNECE'], 0, 'He is its vice president of international operations; he describes it as a volunteer activity.', 3281),
        mc('Which did the speaker say CHV has given away as a CTF prize?', ['A laptop', 'A car (at least twice, per the speaker)', 'A motorbike', 'Nothing'], 1, 'The speaker says cars have been given away as CTF prizes.', 3415),
        mc('What is ASRG?', ['A government regulator', 'A volunteer, member-run non-profit for automotive security education with local chapters', 'A car brand', 'A CTF'], 1, 'The speaker co-founded the Detroit branch.', 3545),
        mc('Where and when is Pwn2Own Automotive held?', ['Las Vegas in August', 'Tokyo in January each year', 'Berlin in March', 'It is virtual'], 1, 'The 2027 event hadn\'t been announced; he guessed September.', 3590),
        mc('How do some OEMs run "bug bashes"?', ['Public auctions', 'Private events where hackers are hosted (flights, hotel, food) and paid for found vulnerabilities', 'Forced audits', 'Court cases'], 1, 'His Italy invitation example.', 3130),
        mc('What advice does he give for getting on buyers\' radar?', ['Send unsolicited proposals to executives', 'Show up where the community and industry gather - events like Car Hacking Village and Pwn2Own', 'Wait for RFPs', 'Post on social media only'], 1, '"You\'re looking at the answer right here."', 3390),
        ms('Which activities does the speaker say Car Hacking Village offers at its events?', ['Hands-on workshops', 'Talks', 'A CTF competition', 'Certifying vehicles'], [0, 1, 2], 'He lists workshops, talks and a CTF with prizes.', 3395),
        mc('Which event had not yet announced its 2027 dates at the time of the talk?', ['DEF CON', 'Pwn2Own Automotive', 'Code Blue', 'ASRG meetups'], 1, 'The speaker guessed the announcement would come around September.', 3615)
      ]
    }
  ]
};
