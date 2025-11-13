const IMAGE_PATH = "images/";
const IMAGE_EXT = "jpg";

const welcomeSpot = {
  name: "Welcome to the Adastral Park Heritage Trail",
  img: "images/welcome.jpg",   // supply any image you like
  info: `

    <p>There are 15 spots on the trail which will guide you around key locations of the site. The trail will take approximately 1 hour.</p>

    <p>To use the app, just follow the direction finder to discover each location in turn. When you get close to a location, the content will be unlocked for you to view. The content is a mix of text, images and audio.
Please be aware of your surroundings at all times and please use the pedestrian paths around the site. Take care when crossing roads.</p>

    <p>Introduction to the Site</p>

    <p>Adastral Park was built as the Post Office Research Centre in the early 1970s, to replace the original research station at Dollis Hill in North London. During the first half of the 1970s purpose built buildings gradually replaced legacy buildings left from the days when the site was part of RAF Martlesham Heath. A large part of the accommodation was built to house specialist and general laboratories and workshops, reflecting that the whole site was dedicated to (mostly hardware) research and development. The initial building work was the main building complex, consisting of the Antares building, the Orion building, the two towers and the Research Services Block with the loading bays. Many other (differently designed) buildings followed though.
The telecommunications part of the Post Office became BT in the early 1980s and the name of the site changed to BT Laboratories. More name changes followed, until in 1999 the site was renamed Adastral Park (a nod to RAF Martlesham Heath's R&D purpose; the RAF motto is "per ardua ad astra" = through adversity to the stars [roughly]). It also became the first and only BT site to house independent companies, under the Innovation Martlesham banner.</p>

     <p>Listen to Lisa Perkins talk about the impact of the Park:</p>
<br> <audio controls src="audio/impact.mp3"></audio>

     <p>Listen to Mike Warden recall the day that the Queen formally opened the site in 1975:</p>
<br> <audio controls src="audio/queen.mp3"></audio>

  `,
  isWelcome: true              // special behaviour flag
};

const spots = [
 {
  name: "Main Lab Block (Orion/Antares)",
  lat: 52.05674493,
  lng: 1.27986381,
  radius: 10,
  info: `
    <p>Originally known as the Main Lab Block or B62. This building housed a significant proportion
    of the labs and offices on site when it was built. It was built to a very high specification and
    took a long time to complete – it was started in 1971 and was not officially opened (by the Queen)
    until late 1975. ...</p>

<br><br> 
    <p>Listen to Mike Warden talk about his memories of the Hurricane damage in 1987.</p>
    
       <br> <audio controls src="audio/hurricane.mp3"></audio>
      <br><br>
    <p>Listen to Pete Cochrane recall some unusual incidents with low flying aircraft.</p>
    <br> <audio controls src="audio/aircraft.mp3"></audio>
  `,
},

  {
    name: "Acoustic Block",
    lat: 52.05671008,
    lng: 1.28002642,
    radius: 10,
    info: 
      <p>The Adastral Acoustic Block includes anechoic chambers and a reverberation room and is an important facility for the site to allow audio experimentation and measurement – a key part of telecommunications.
Listen to Chris Adams describe how an anechoic chamber and reverberation room works and how they are used. </p>
       <br> <audio controls src="audio/accoustic1.mp3"></audio>
  },
  {
    name: "Old Post Room",
    lat: 52.05734795,
    lng: 1.27954631,
    radius: 20,
    info: 
      <p>At one time, a former WW2 building stood in this location. The building was the old hospital for the RAF Martlesham Heath airfield. When the GPO took over the site, the building became the post room until it was demolished.

        Listen to Bernie Fenn talk about his memories of working in the building:
<br> <audio controls src="audio/postroom1.mp3"></audio>

        The building was demolished as part of a major redevelopment of the site in the 1990’s. 

        Listen to Bruce Boxall talk about the background to this redevelopment:
<br> <audio controls src="audio/redevelopment.mp3"></audio>
        In this recording, Bruce talks about the specific changes that were made as part of the redevelopment:</p>
<br> <audio controls src="audio/redevelopment2.mp3"></audio>
       
  },
  {
    name: "B1",
    lat: 52.06050806,
    lng: 1.27999692,
    radius: 25,
    info: <p>Building B1, visible to the west, is one of the former RAF Martlesham Heath buildings from WW2 and is now part of Innovation Martlesham. The building is rumoured to be haunted.</p>

<p><strong>Listen to Mike Warden talk about sightings of the ghost of B1:</strong><br>
<audio controls src="audio/placeholder7.mp3"></audio></p>

<p><strong>Listen to Bernie Fenn talk about trying to spot the ghost:</strong><br>
<audio controls src="audio/placeholder8.mp3"></audio></p>
  },
  {
    name: "Waveguide",
    lat: 52.06077374,
    lng: 1.28135277,
    radius: 15,
    info: <p>Beneath these slabs lies one of the first microwave waveguides installed by the Post Office Research Centre. One of the first research divisions to move from Dollis Hill was the waveguide transmission division.</p>

<p>Microwave signals were transmitted through precision-engineered piping, with a wire helix wrapped around the outside to contain the energy. These buried waveguides were seen as more reliable and faster than transmitting through the air.</p>

<p>A later system connected Portman Road exchange in Ipswich with Wickham Market, carrying live calls through the 1970s and 80s. But by the mid-1970s, fibre-optic cable — another form of waveguide — proved superior: higher capacity, smaller, cheaper, and easier to install.</p>

<p>BT became a world leader in fibre-optic technology during the late 1970s and 1980s.</p>

<p>Scroll the slider images below to see installation of the waveguide project.</p>
  },
  {
    name: "Submarine, Robotics and Drones",
    lat: 52.0593466,
    lng: 1.28245784,
    radius: 18,
    info: <p>This facility originally housed subsea cable testing, which is why the 12.5-tonne gantry crane still remains. Today the building supports robotics and drone R&D and contains indoor testbeds that simulate real-world civil engineering environments such as ducts, poles, and underground chambers.</p>

<p><strong>Listen to Jon Wakeling talk about current research:</strong><br>
<audio controls src="audio/placeholder9.mp3"></audio></p>

<p><strong>Listen to Bruce Boxall discuss his silicon work in the submarine network:</strong><br>
<audio controls src="audio/placeholder10.mp3"></audio></p>
  },
  {
    name: "The Digitech Centre",
    lat: 52.05925789,
    lng: 1.28514944,
    radius: 15,
    info: <p>The Digitech Centre, opened in 2021, is a partnership between BT and the University of Suffolk. It provides undergraduate and postgraduate teaching across a wide range of digital technology disciplines.</p>

<p><strong>Listen to Tim Whitley discuss the new centre:</strong><br>
<audio controls src="audio/placeholder11.mp3"></audio></p>

<p><strong>Listen to Meral Bence describe how the centre was created:</strong><br>
<audio controls src="audio/placeholder12.mp3"></audio></p>
  },
  {
    name: "Martlesham Teleport",
    lat: 52.05930828,
    lng: 1.28618477,
    radius: 25,
    info: <p>Through the trees ahead are the satellite dishes of Martlesham Teleport. Once operated by BT and now by Arqiva, the Teleport is used by broadcasters worldwide to route content between locations. The funeral of Diana, Princess of Wales, was relayed globally from here in 1997. It remains the UK’s most easterly satellite earth station.</p>

<p><strong>Listen to Jon Wakeling discuss the teleport’s history:</strong><br>
<audio controls src="audio/placeholder13.mp3"></audio></p>
  },
  {
    name: "ROMES",
    lat: 52.05926545,
    lng: 1.2858495,
    radius: 15,
    info: `This area was formerly used to store emergency exchange hardware that could support rural exchanges in emergencies but is now used for research into space communications.`
  },
  {
    name: "Smart Home",
    lat: 52.0592116,
    lng: 1.28462507,
    radius: 15,
    info: `Built in partnership between BT and the University of Suffolk as part of the Digitech Project, this Smart Home allows testing of emerging technologies in construction, living and sustainability.`
  },
  {
    name: "Sports Hall",
    lat: 52.05920839,
    lng: 1.28417848,
    radius: 20,
    info: `Supports health and wellbeing through teamwork and fitness. Facilities include basketball, netball, badminton, Judo, and model aeroplane flying.`
  },
  {
    name: "Gaming",
    lat: 52.05886422,
    lng: 1.28180741,
    radius: 15,
    info: `Wireplay was an online multiplayer gaming network developed by BT in the 1990s. It allowed players to enjoy PC games together remotely.`
  },
  {
    name: "Emergency Services",
    lat: 52.05734862,
    lng: 1.28259329,
    radius: 20,
    info: `Adastral Park has its own emergency services team with fire and ambulance vehicles. The first BT Emergency Team formed in 1977.`
  },
  {
    name: "Network Ops",
    lat: 52.05718534,
    lng: 1.2811905,
    radius: 15,
    info: `The Network Operation Centre plays a critical role in managing BT’s network including broadband, leased lines and mobile backhaul services.`
  },
  {
    name: "Innovation Martlesham",
    lat: 52.05744922,
    lng: 1.2811905,
    radius: 18,
    info: `Innovation Martlesham is the name of the vibrant ecosystem of ICT/Digital companies launched in 2011 to promote collaboration and creativity.`
  },
  {
    name: "Heritage Centre",
    lat: 52.05891122,
    lng: 1.27937062,
    radius: 20,
    info: `This is the past spot on the trail!  Congratulations! You have arrived at the last location on the trail — the new Adastral Park Heritage Centre. Please take the time to enjoy learning about the history of the site.`
  }
];

// Auto-generate image URLs
const toFileName = name =>
  name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.' + IMAGE_EXT;

spots.forEach(s => s.img = IMAGE_PATH + toFileName(s.name));
