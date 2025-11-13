const IMAGE_PATH = "images/";
const IMAGE_EXT = "jpg";

const spots = [
  {
    name: "Main Lab Block (Orion/Antares)",
    lat: 52.05674493,
    lng: 1.27986381,
    radius: 10,
    info: <p>Originally known as the Main Lab Block or B62. This building housed a significant proportion of the labs and offices on site when it was built. It was built to a very high specification and took a long time to complete – it was started in 1971 and was not officially opened (by the Queen) until late 1975. ...</p>
<p><p>Listen to Mike Warden talk about his memories of the Hurricane damage in 1987.</p></p>
<p>Listen to Pete Cochrane recall some unusual incidents with low flying aircraft.</p>,
    audio: [
    { label: "Mike Warden – Hurricane 1987", src: "audio/hurricane.mp3" },
    { label: "Pete Cochrane – Low Flying Aircraft", src: "audio/aircraft.mp3" }
  ]
  },
  {
    name: "Acoustic Block",
    lat: 52.05671008,
    lng: 1.28002642,
    radius: 10,
    info: `The Adastral Acoustic Block includes anechoic chambers and a reverberation room and is an important facility for the site to allow audio experimentation and measurement – a key part of telecommunications.
Listen to Chris Adams describe how an anechoic chamber and reverberation room works and how they are used.`
  },
  {
    name: "Old Post Room",
    lat: 52.05734795,
    lng: 1.27954631,
    radius: 20,
    info: `At one time, a former WW2 building stood in this location. The building was the old hospital for the RAF Martlesham Heath airfield. When the GPO took over the site, the building became the post room until it was demolished. 
Listen to Bernie Fenn talk about his memories of working in the building.
The building was demolished as part of a major redevelopment of the site in the 1990s.`
  },
  {
    name: "B1",
    lat: 52.06050806,
    lng: 1.27999692,
    radius: 25,
    info: `If you look to your west, you’ll see Building B1 at the end of the roadway. The building was one of the former RAF Martlesham Heath buildings from WW2. Currently it is part of Innovation Martlesham. The building is rumoured to be haunted.
Listen to Mike Warden talk about sightings of the ghost of B1.`
  },
  {
    name: "Waveguide",
    lat: 52.06077374,
    lng: 1.28135277,
    radius: 15,
    info: `Underneath the slabs is where a waveguide was installed. The Post Office and later BT became world leaders in fibre-optic communication in the late 1970s and 1980s.`
  },
  {
    name: "Submarine, Robotics and Drones",
    lat: 52.0593466,
    lng: 1.28245784,
    radius: 18,
    info: `The building’s original use was to house the subsea cable testing facility. Currently, the facility is used for robotics and drones R&D and houses a unique set of indoor testbeds that emulate the real-world civil engineering environments found under footways, in ducts and up poles.`
  },
  {
    name: "The Digitech Centre",
    lat: 52.05925789,
    lng: 1.28514944,
    radius: 15,
    info: `Opened in 2021, a partnership between BT and the University of Suffolk providing facilities that teach digital sciences at undergraduate and post-graduate levels.`
  },
  {
    name: "Martlesham Teleport",
    lat: 52.05930828,
    lng: 1.28618477,
    radius: 25,
    info: `The Teleport is one of a handful of earth stations used by broadcasters around the world to transmit content between different locations. It’s understood that the funeral of Diana, Princess of Wales in 1997, was relayed from here.`
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
    info: `Congratulations! You have arrived at the last location on the trail — the new Adastral Park Heritage Centre. Please take the time to enjoy learning about the history of the site.`
  }
];

// Auto-generate image URLs
const toFileName = name =>
  name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.' + IMAGE_EXT;

spots.forEach(s => s.img = IMAGE_PATH + toFileName(s.name));
