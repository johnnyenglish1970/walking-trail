// spots.js
const IMAGE_EXT = "jpg";
const IMAGE_PATH = "images/";

const spots = [
  {
    name: "Main Lab Block (Orion/Antares)",
    lat: 52.05674493,
    lng: 1.27986381,
    info: `Originally known as the Main Lab Block or B62...`
  },
  {
    name: "Acoustic Block",
    lat: 52.05671008,
    lng: 1.28002642,
    info: `The Adastral Acoustic Block includes anechoic chambers and a reverberation room...`
  },
  {
    name: "Old Post Room",
    lat: 52.05734795,
    lng: 1.27954631,
    info: `A former WW2 building once stood here – the old RAF hospital, later the site’s Post Room...`
  },
  {
    name: "B1",
    lat: 52.06050806,
    lng: 1.27999692,
    info: `If you look west, you’ll see Building B1 – one of the original RAF buildings, now part of Innovation Martlesham...`
  },
  {
    name: "Waveguide",
    lat: 52.06077374,
    lng: 1.28135277,
    info: `Under these slabs ran one of the UK’s first waveguide transmission lines – an early form of microwave communication...`
  },
  {
    name: "Submarine, Robotics and Drones",
    lat: 52.0593466,
    lng: 1.28245784,
    info: `Originally built for subsea cable testing, this building now houses robotics and drone research...`
  },
  {
    name: "The Digitech Centre",
    lat: 52.05925789,
    lng: 1.28514944,
    info: `Opened in 2021 in partnership with the University of Suffolk – home to digital sciences and innovation...`
  },
  {
    name: "Martlesham Teleport",
    lat: 52.05930828,
    lng: 1.28618477,
    info: `The satellite dishes of Martlesham Teleport are visible through the trees – a vital link for global broadcasts...`
  },
  {
    name: "ROMES",
    lat: 52.05926545,
    lng: 1.2858495,
    info: `Formerly home to emergency exchange hardware, now used for research into space communications...`
  },
  {
    name: "Smart Home",
    lat: 52.0592116,
    lng: 1.28462507,
    info: `A Smart Home built for sustainable construction and digital living experiments...`
  },
  {
    name: "Sports Hall",
    lat: 52.05920839,
    lng: 1.28417848,
    info: `The sports hall supports fitness, teamwork, and well-being – used for basketball, judo, and more...`
  },
  {
    name: "Gaming",
    lat: 52.05886422,
    lng: 1.28180741,
    info: `Wireplay – BT’s 1990s multiplayer gaming network – allowed players to connect and compete remotely...`
  },
  {
    name: "Emergency Services",
    lat: 52.05734862,
    lng: 1.28259329,
    info: `Adastral Park has its own emergency services – including fire and ambulance vehicles...`
  },
  {
    name: "Network Ops",
    lat: 52.05718534,
    lng: 1.2811905,
    info: `The Network Operations Centre manages BT’s broadband and leased-line networks nationwide...`
  },
  {
    name: "Innovation Martlesham",
    lat: 52.05744922,
    lng: 1.2811905,
    info: `Innovation Martlesham is a thriving ecosystem of tech companies promoting collaboration and innovation...`
  },
  {
    name: "Heritage Centre",
    lat: 52.05891122,
    lng: 1.27937062,
    info: `The Heritage Centre celebrates the rich history and technological achievements of Adastral Park...`
  }
];

const toFileName = name =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "." + IMAGE_EXT;

spots.forEach(s => (s.img = IMAGE_PATH + toFileName(s.name)));
