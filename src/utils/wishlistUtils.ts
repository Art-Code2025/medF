export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  productId: number;
}

export const getWishlistItems = (): WishlistItem[] => {
  try {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return [];
  }
};

export const addToWishlist = (item: WishlistItem): void => {
  try {
    const wishlist = getWishlistItems();
    const existingIndex = wishlist.findIndex(w => w.productId === item.productId);
    
    if (existingIndex === -1) {
      wishlist.push(item);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
};

export const removeFromWishlist = (productId: number): void => {
  try {
    const wishlist = getWishlistItems();
    const updatedWishlist = wishlist.filter(item => item.productId !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
  }
};

export const isInWishlist = (productId: number): boolean => {
  const wishlist = getWishlistItems();
  return wishlist.some(item => item.productId === productId);
}; 