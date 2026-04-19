export const brand = {
  name: "Shree Hari Cutpiece",
  shortName: "Shree Hari",
  city: "Ahmedabad",
  state: "Gujarat",
  email: "hello@shreeharicutpiece.com",
  phoneDisplay: "+91 98250 44771",
  whatsappNumber: "919825044771",
  instagramUrl: "https://www.instagram.com/shreeharicutpiece/",
  mapsUrl: "https://maps.google.com/?q=Dhalgarwad+Textile+Market+Ahmedabad",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9544364485253!2d72.5831968!3d23.0233481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f7b649a159%3A0xe48ab22d1cc32a10!2sTextile%20Market!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  addressLines: [
    "Dhalgarwad Textile Market",
    "Near Maskati Market, Kalupur",
    "Ahmedabad, Gujarat - 380001",
    "India",
  ],
  storeHoursWeekday: "Monday - Saturday: 10:00 AM - 8:00 PM",
  storeHoursWeekend: "Sunday: 11:00 AM - 6:00 PM",
};

export function getWhatsAppUrl(message?: string): string {
  if (!message) return `https://wa.me/${brand.whatsappNumber}`;
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
