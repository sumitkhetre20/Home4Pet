/**
 * Returns a high-quality species-specific placeholder image URL from Unsplash.
 * 
 * @param {string} species - The pet species (e.g. DOG, CAT, BIRD, etc.)
 * @returns {string} The Unsplash image URL
 */
export const getPetPlaceholder = (species) => {
  switch (species?.toUpperCase()) {
    case 'DOG':
      return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=500';
    case 'CAT':
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500';
    case 'BIRD':
      return 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=500';
    case 'RABBIT':
      return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=500';
    case 'FISH':
      return 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=500';
    default:
      return 'https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=500';
  }
};
