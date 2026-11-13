// Hand-authored Giant Store Bennebroek — the shared template synthesized official-store pages build on.
// ponytail: this one is edited by hand. Scraped per-store content (if ever added) belongs in its own
// generated file, not here (see docs/store-finder/08-per-store-content-scrape.md).
import type { Store } from './store'

const IMG = '/images' // asset root (public/images)

export const giantBennebroek: Store = {
  id: '1',
  slug: 'giant-store-bennebroek', // unified with the finder slug (slugify("Giant Store Bennebroek"))
  name: 'Giant Bennebroek',
  type: 'store',
  brand: 'giant',
  hero: {
    image: 'https://static.giant-bicycles.com/Images/StoreSites/Banners/1920x600_1675345157.jpg',
    label: 'Official Giant store',
  },
  contact: {
    openStatus: 'Open now - closes 20:00',
    address: 'Bennebroekerlaan 83 - Bennebroek',
    phone: '023-5840654',
    email: 'giant-bennebroek@giant-bicycles.com',
  },
  features: [
    { icon: 'check', label: 'Repairs and servicing' },
    { icon: 'check', label: 'New bike pick-up' },
    { icon: 'check', label: 'Dynamic Cycling Fit' },
    { icon: 'check', label: 'Bike customisation' },
    { icon: 'check', label: 'Test rides' },
  ],
  intro:
    'Welcome to Giant Bennebroek, a family-run shop with over 40 years of experience dedicated to road bikes and a wide range of e-bikes. Where passion for cycling meets personalized service.',

  service: {
    eyebrow: 'SERVICE',
    title: 'Book an appointment',
    body:
      "At Giant's Customization Service, you can design a bike that truly represents you. Select your preferred paint finish, adjust the essential components, and customize every detail to create a ride that matches your personality. Ready to get started? Book a time slot with us today!",
    bookHeading: 'Book a service',
    services: [
      {
        icon: 'tune',
        label: 'Bike repair',
        description:
          "Drop your bike off for a check-up or repair. Most jobs are done the same day. We'll call with a quote before starting any major work.",
      },
      {
        icon: 'tune',
        label: 'Dynamic Cycling Fit',
        description:
          'Set aside about two hours for a dynamic, motion-capture session with a certified fitter. From € 149,00, included with a road bike purchase.',
      },
      {
        icon: 'tune',
        label: 'Bike rental',
        description:
          'Rent a Giant bike by the day or the week, helmet and lock included. Reserve ahead in busy season to guarantee your size.',
      },
      {
        icon: 'tune',
        label: 'Bike customization',
        description:
          "Design a bike that's truly yours — choose your paint finish, components and finishing touches with help from our specialists.",
      },
      {
        icon: 'tune',
        label: 'Test ride',
        description:
          "Book a test ride to feel the difference before you buy. Bring your ID and we'll set the bike up to your size and preferences.",
      },
    ],
    cta: 'Book a service',
    image: '/images/service.jpg',
  },

  banner: {
    title: 'Ultimate Speed',
    body: 'Discover our all-new Propel Range',
    cta: 'Discover',
    ctaSecondary: 'Visit store',
    image: `${IMG}/banner.jpg`,
  },

  about: {
    eyebrow: 'ABOUT US',
    title: 'Giant Bennebroek',
    specialtiesLabel: 'Our specialties',
    specialties: [
      { icon: 'check', label: 'Road bikes' },
      { icon: 'check', label: 'E-bikes' },
      { icon: 'check', label: 'Gravel' },
    ],
    paragraphs: [
      'Here you will find passionate cycling professionals who have been active in the trade for many years. With knowledge, but above all a great love for everything related to cycling, we are at your service.',
      'With a wide range of electric bikes, road bikes, gravel bikes, mountain bikes, and of course city bikes, always in sufficient stock, we can provide everyone with a suitable bike. With our range of accessories, we can truly outfit any bike. From panniers to sports nutrition, from child seats to bottle holders, all available from stock and ready for installation.\n\nFeel free to drop by. In our Giant Store, we aim to keep things professional, but above all, approachable. By that, we mean that you are naturally very welcome in our store with questions big or small. Whether it is for a chat, a question, or an introductory meeting over a cup of coffee.',
    ],
    stats: [
      { value: '1972', label: 'Established' },
      { value: '4.8/5', label: 'Avg. review score' },
      { value: '853m²', label: 'Store surface' },
    ],
    gallery: [
      { src: `${IMG}/store-gallery/gallery1.jpg`, alt: 'Store interior' },
      { src: `${IMG}/store-gallery/gallery2.jpg`, alt: 'Workshop' },
      { src: `${IMG}/store-gallery/gallery3.jpg`, alt: 'Showroom' },
      { src: `${IMG}/store-gallery/gallery4.jpg`, alt: 'Coffee corner' },
      { src: `${IMG}/store-gallery/gallery5.jpg`, alt: 'Test ride' },
    ],
  },

  team: {
    title: 'Meet the team',
    members: [
      {
        name: 'Olaf Verhoeve',
        role: 'Sales en Service (Owner)',
        description:
          'Bicycle maker father Jan and grandfather Verhoeve already had an intensive collaboration with the "van Bakels" in the 1930s, so cycling was instilled in him from a young age.',
        photo: `${IMG}/employees/Avatar.jpg`,
      },
      {
        name: 'Josje Verhoeven',
        role: 'Sales',
        description:
          'Josje has been a cyclist since childhood. Even today, she prefers to cycle to work. In addition to her job as a salesperson/purchaser, she also teaches in primary education. This way, she can inspire the new generation to take up cycling as well.',
        photo: `${IMG}/employees/Avatar-1.jpg`,
      },
      {
        name: 'Ciska Verhoeve',
        role: 'Bikefitter',
        description:
          'Ciska is a physiotherapist and ensures you sit perfectly on the bike with a professional bike fitting, supported by the renowned Bikefitting.com software. As a toddler, she was already running around the workshop and riding her little bike on her first cycling holidays. Now, she is unstoppable on her road bike. Alongside her busy life, she is trying to master guitar chords and enjoys painting and drawing.',
        photo: `${IMG}/employees/Avatar-2.jpg`,
      },
      {
        name: 'Marco de Goede',
        role: 'Mechanic',
        description:
          'Marco understands what service is after 25 years of (his own) entrepreneurship; he embodies our business philosophy as if it were his own company.',
        photo: `${IMG}/employees/Avatar-3.jpg`,
      },
    ],
  },

  inventory: {
    eyebrow: 'OUR COLLECTION',
    title: 'Store inventory',
    groups: [
      {
        title: 'Bikes',
        cards: [
          { title: 'Road bikes', image: `${IMG}/products/road.jpg`, href: '#' },
          { title: 'Mountain Bikes', image: `${IMG}/products/mountain.jpg`, href: '#' },
          { title: 'Cross & Gravel Bikes', image: `${IMG}/products/cross-gravel.jpg`, href: '#' },
          { title: 'City Bikes', image: `${IMG}/products/city.jpg`, href: '#' },
          { title: 'E-bikes', image: `${IMG}/products/e-bikes.jpg`, href: '#' },
          { title: 'Kids Bikes', image: `${IMG}/products/kids.jpg`, href: '#' },
        ],
      },
      {
        title: 'Gear',
        cards: [
          { title: 'Rider Gear', image: `${IMG}/products/rider-gear.jpg`, href: '#' },
          { title: 'Bike Gear', image: `${IMG}/products/bike-gear.jpg`, href: '#' },
          { title: 'Service Gear', image: `${IMG}/products/service-gear.jpg`, href: '#' },
          { title: 'Components', image: `${IMG}/products/components.jpg`, href: '#' },
        ],
      },
      {
        title: 'Other',
        cards: [
          { title: 'Used bikes', href: '#', subtitle: 'Markplaats' },
          { title: 'Cargo Bikes', href: '#' },
        ],
      },
    ],
  },

  dcf: {
    eyebrow: 'DCF',
    title: 'Find your perfect position',
    intro:
      'A data-driven fitting that measures you in motion. Improving comfort, power and efficiency on every ride. A session takes minutes.',
    body:
      'Get the professional insight you need to unleash performance, avoid injury and find unparalleled comfort via the hard science behind Dynamic Cycling Fit. The DCF Bike Fitting program utilizes a cutting-edge motion capture system. This uses advanced technology and software to perfect your fit. Ultra-wide range motion and real-time tool-free adjustments allow the rider to pedal till they feel perfection.',
    steps: [
      { title: 'Interview', description: 'We talk goals, history and how you ride today.' },
      { title: 'Measurement', description: 'Flexibility, range of motion and any imbalances.' },
      { title: 'Physical Assessment', description: '3D sensors record your pedal stroke in real time.' },
      { title: 'Pedal and Saddle', description: 'Saddle, cleats and cockpit dialled in live on the rig.' },
      { title: 'DCF app Profile', description: 'A written report and a free check-in after 6 weeks.' },
    ],
    tier: {
      eyebrow: 'DCF TIER',
      title: 'Certified DCF Supreme Partner',
      body:
        'Get the professional insight you need to unleash performance, avoid injury and find unparalleled comfort via the hard science behind Dynamic Cycling Fit. The DCF Bike Fitting program utilizes a cutting-edge motion capture system. This uses advanced technology and software to perfect your fit. Ultra-wide range motion and real-time tool-free adjustments allow the rider to pedal till they feel perfection.',
      image: `${IMG}/dcf.jpg`,
      cta: 'Book a fitting session',
    },
  },

  directions: {
    eyebrow: 'DIRECTIONS',
    title: 'Visit the store',
    intro:
      'On the Bennebroekerlaan, a short ride from the village center, with bike parking right outside the door.',
    map: { image: `${IMG}/map.jpg`, lat: 52.321475, lng: 4.600587 },
    openingHours: [
      { day: 'Wednesday', hours: 'Open – 18:00' },
      { day: 'Thursday', hours: '09:00 – 18:00' },
      { day: 'Friday', hours: '09:00 – 18:00' },
      { day: 'Saturday', hours: '09:00 – 17:00' },
      { day: 'Sunday', hours: 'Closed' },
      { day: 'Monday', hours: 'Closed' },
      { day: 'Tuesday', hours: '09:00 – 18:00' },
    ],
    byTransport:
      'Take the train to Heemstede-Aerdenhout, then bus 50 toward Bennebroek and get off at the Bennebroekerlaan stop.',
    byCar:
      'Find us on the Bennebroekerlaan (N208) through Bennebroek. From the A4, take the Nieuw-Vennep/Bennebroek exit and follow signs into the village.',
    parking:
      'Limited parking is available in front of the store. There is a free parking lot across the road at De Glip 4, Bennebroek.',
  },

  faq: {
    eyebrow: 'GOOD TO KNOW',
    title: 'Frequently Asked Questions',
    contact: {
      question: 'Still have a question?',
      note: 'Our team is happy to help in-store, by phone or email.',
      phone: '+31 20 778 4120',
      email: 'hello@giantstore-bennebroek.nl',
    },
    items: [
      { question: 'Do I need to make an appointment for service?', answer: 'Walk-ins are welcome, but booking ahead guarantees a slot and shortens your wait.' },
      { question: 'Can I test ride a bike?', answer: 'Yes — bring an ID and we will set you up with a test bike in your size.' },
      {
        question: 'How long does a repair take?',
        answer:
          'Standard service has an average turnaround of 48 hours. Minor jobs like a flat or a brake adjustment are often done while you wait. Express same-day service is available for an extra fee, subject to availability.',
        defaultOpen: true,
      },
      { question: 'Do you offer trade-ins?', answer: 'We accept trade-ins on most brands; bring your bike in for a free valuation.' },
      { question: 'What payment methods do you accept?', answer: 'All major cards, iDEAL, and financing options for larger purchases.' },
    ],
  },

  articles: {
    eyebrow: 'News',
    title: 'Latest Articles',
    viewAllLabel: 'View all news',
    items: [
      {
        title: 'Cycle Shop Innovations',
        body:
          'Our cutting-edge carbon fiber is skillfully manufactured at our facility, yielding the lightest and strongest frames. This innovative technology is favored by leading athletes in various cycling events.',
        ctaLabel: 'Learn more',
        image: `${IMG}/articles/Image.jpg`,
        href: '#',
      },
      {
        title: 'Bike Shop Innovations',
        body:
          'Professional Grade raw carbon fiber is woven in our composite factory to produce our lightest, stiffest and highest quality frames. This is the technology used by Giant’s pro racers in almost every cycling discipline.',
        ctaLabel: 'Learn more',
        image: `${IMG}/articles/Image-1.jpg`,
        href: '#',
      },
      {
        title: 'Cycle Shop Creations',
        body:
          'Professional Grade raw carbon fiber is woven in our composite factory to produce our lightest, stiffest and highest quality frames. This is the technology used by Giant’s pro racers in almost every cycling discipline.',
        ctaLabel: 'Learn more',
        image: `${IMG}/articles/Image-2.jpg`,
        href: '#',
      },
    ],
  },

  brands: {
    title: 'Our brands',
    primary: [
      { name: 'Giant', logo: `${IMG}/brands/giant.jpg` },
      { name: 'Liv', logo: `${IMG}/brands/liv.jpg` },
      { name: 'CADEX', logo: `${IMG}/brands/cadex.jpg` },
    ],
    gearTitle: 'Gear & components',
    gear: [
      { name: 'Shimano', logo: `${IMG}/brands/shimano.jpg` },
      { name: 'SRAM', logo: `${IMG}/brands/sram.jpg` },
      { name: 'Selle Royal', logo: `${IMG}/brands/selleroyal.jpg` },
      { name: 'AGU', logo: `${IMG}/brands/agu.jpg` },
      { name: 'Vaude', logo: `${IMG}/brands/vaude.jpg` },
      { name: 'Enjoy', logo: `${IMG}/brands/enjoy.jpg` },
    ],
  },
}
