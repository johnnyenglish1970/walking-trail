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
    name: "The Village Hall",
    lat: 52.08442785,
    lng: 1.23134315,
    radius: 12,
    info: `
      <p>Did you know where Playford got its name? One theory is that it originated from “Plega Forda,” meaning “battle,” referring to a local encounter between the Danes and Saxons. In early times the River Fynn was large enough for boats to travel along it, and artefacts—including a Saxon sword now in the British Museum—support this theory.</p>

      <p>Playford appears in the Domesday Book of 1086, where a manor house, watermill, and church are all recorded. Historically a farming community, Playford is now known for its peaceful setting and rural charm.</p>
    `
  },

  {
    name: "Hurricane Crash Site",
    lat: 52.08410150,
    lng: 1.23158991,
    radius: 12,
    info: `
      <p>Many will remember the Great Storm of 1987—but did you know that a Hurricane hit Playford long before that?</p>

      <p>On 29 January 1940, Hawker Hurricane Mk.I L1984 of 56 Squadron RAF was forced to crash-land near Playford’s playing field. The aircraft struck a cottage, overturning on impact. Frozen snow drawn into the supercharger caused engine failure during a scramble against enemy aircraft.</p>

      <p>The pilot, Sergeant Cecil John Cooney, survived the crash but was later killed in action in July 1940. Repairs to the cottage can still be seen today.</p>
    `
  },

  {
    name: "Rocket Pit",
    lat: 52.08016536,
    lng: 1.22529745,
    radius: 12,
    info: `
      <p>It may sound unbelievable, but Playford was once hit by a German V2 rocket. On 11 October 1944 at 2:20pm, a V2 impacted the village, creating a crater 39 feet wide and over 12 feet deep. The blast blew a farm worker off his tractor and shattered windows throughout the village.</p>

      <p>The crater, known for years as the “Rocket Pit,” was later used as a rubbish dump before being filled in. On dry summers, some say the scar can still be seen from the air.</p>

      <br><img src="images/rocket-pit.jpg" class="info-img">
      <br><img src="images/rocket-pit-aerial.jpg" class="info-img">
      <br><img src="images/v2-rocket.jpg" class="info-img">
    `
  },

  {
    name: "The Naughtiest Girl in the World",
    lat: 52.08644522,
    lng: 1.23539329,
    radius: 12,
    info: `
      <p>This story tells of Peggy Fisk, a well-loved resident of the village. Whenever Peggy misbehaved as a child, her mother would punish her by sending her into the fields to dig up snowdrops and replant them in the churchyard.</p>

      <p>To this day, St Mary’s Churchyard is covered in thousands of snowdrops each spring — a beautiful legacy of a very “naughty” girl!</p>
    `
  },

  {
    name: "Thunderstruck Toilet",
    lat: 52.08672540,
    lng: 1.23526454,
    radius: 12,
    info: `
      <p>In 2015, a powerful thunderstorm rolled over Playford. A bolt of lightning struck next to St Mary’s Church, blowing fuses in nearby houses. The church itself was untouched — but the outdoor wooden toilet beside it was completely destroyed.</p>

      <p>Many wondered how lightning hit the small shed instead of the tall church tower just five metres away. Luck, coincidence, or divine protection? We’ll never know.</p>
    `
  },

  {
    name: "Airy’s Cottage – Where Time Begins",
    lat: 52.08595737,
    lng: 1.23477638,
    radius: 12,
    info: `
      <p>Sir George Biddell Airy, Astronomer Royal from 1835 to 1881, lived here at Airy’s Cottage. He designed the Airy Transit Circle, the telescope that defined the Prime Meridian — the basis of Greenwich Mean Time (GMT).</p>

      <p>His observations, using spider-web threads stretched across the eyepiece, allowed exact timing of stars crossing the meridian, helping set the world’s clocks.</p>

      <p>Airy’s garden once contained a large larch tree grown from a seedling taken from Greenwich Observatory.</p>
    `
  },

  {
    name: "Anna Airy – Artist of War and Peace",
    lat: 52.08602329,
    lng: 1.23489439,
    radius: 12,
    info: `
      <p>Anna Airy, granddaughter of Sir George Biddell Airy, was one of the first women officially commissioned as a war artist in WW1. A respected painter and etcher, she became president of the Ipswich Art Society for 24 years.</p>

      <p>An annual award in her name continues to support young artists today.</p>
    `
  },

  {
    name: "Lost Inns of Playford",
    lat: 52.08526843,
    lng: 1.23208880,
    radius: 12,
    info: `
      <p>Playford once had at least two pubs: the Kicking Donkey at the top of Brook Lane and the Eels’ Foot on Church Lane (formerly Slush Lane). The Eels’ Foot was said to be popular with smugglers travelling over the heath from Hollesley Bay.</p>

      <p>Legend tells of villagers waking to find their horses muddy and exhausted — with a casket of spirits left behind in thanks.</p>
    `
  },

  {
    name: "The Old Shop and Post Office",
    lat: 52.08489594,
    lng: 1.23075306,
    radius: 12,
    info: `
      <p>Playford once had its own shop and post office. The earliest was located at the corner of Hill Farm Road and Butts Road before later moving to Church Lane.</p>

      <p>Villagers remember shelves of glass jars filled with wine gums, aniseed balls, sherbet dips, and Bazooka Joe gum — all sold by the quarter.</p>
    `
  },

  {
    name: "The Village School",
    lat: 52.08450696,
    lng: 1.23509288,
    radius: 12,
    info: `
      <p>Playford once had a small village school, remembered fondly by older residents. Though no longer standing, it played an important role in early village life and community identity.</p>
    `
  },

  {
    name: "Football Legends of Playford",
    lat: 52.08512998,
    lng: 1.23379469,
    radius: 12,
    info: `
      <p>During the golden era of Ipswich Town FC in the 1970s and early 1980s, manager Sir Bobby Robson lived in a house in Spring Meadow. Players such as Frans Thijssen were frequent visitors.</p>

      <p>One villager recalls owning Thijssen’s leather jacket — bought at a local jumble sale!</p>
    `
  },

  {
    name: "View over the Mere – Peaceful Charm",
    lat: 52.08387075,
    lng: 1.23709917,
    radius: 12,
    info: `
      <p>This spot overlooks one of the most beautiful views in Playford: the Fynn Valley and Playford Mere.</p>

      <p>The former mill can be seen across the valley, and the railway line built in the 1850s still runs from Ipswich to Lowestoft. In Saxon times, the Mere served as a tidal harbour.</p>
    `
  },

  {
    name: "Thomas Clarkson – Freedom from Slavery",
    lat: 52.08659685,
    lng: 1.23529673,
    radius: 12,
    info: `
      <p>Thomas Clarkson (1760–1846) was one of the most influential abolitionists in British history. His tireless campaigning helped secure the 1807 Act abolishing the slave trade, and he continued the fight until slavery itself was abolished in 1833.</p>

      <p>Clarkson lived at Playford Hall, where he welcomed abolitionists from around the world, including Frederick Douglass and Harriet Beecher Stowe. He is buried in St Mary’s Churchyard.</p>
    `
  },

  {
    name: "VE Day Celebration on the Green",
    lat: 52.08443444,
    lng: 1.23112321,
    radius: 12,
    info: `
      <p>On 8 May 1945, villagers gathered on the green to celebrate the end of the war in Europe. Local farmer Mr Fisk organised a bonfire, and one resident brought out Molotov Cocktails stored under the Village Hall stage—kept by the Home Guard in case of invasion.</p>

      <p>Fortunately, the fire was lit safely, and the village celebrated long into the night.</p>
    `
  }
];

// Auto-generate image URLs
const toFileName = name =>
  name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.' + IMAGE_EXT;

spots.forEach(s => s.img = IMAGE_PATH + toFileName(s.name));
