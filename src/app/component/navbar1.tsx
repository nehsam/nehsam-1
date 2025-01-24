"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "next-sanity";
import { FaRegHeart, FaSearch, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { LucideShoppingCart } from "lucide-react";
import { RiDashboardLine } from "react-icons/ri";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

// Sanity client configuration
const client = createClient({
  projectId: "15hm7ok6",
  dataset: "production",
  apiVersion: "2024-01-20",
  useCdn: false,
});

// Define types for Sanity products
interface SanityProduct {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  description: string;
  imageUrl: string;
}

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SanityProduct[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function for Sanity
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const sanityQuery = `*[_type == "product" && (title match "*${query}*" || description match "*${query}*")] | order(_createdAt desc)[0...10] {
          _id,
          title,
          price,
          discountedPrice,
          description,
          "imageUrl": productImage.asset->url
        }`;
        const results = await client.fetch(sanityQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  function debounce<T extends (query: string) => Promise<void>>(func: T, wait: number): (query: string) => void {
      let timeout: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(query), wait);
      };
    }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const { user } = useUser();
  const auth = useAuth();
  const userId = user?.id || auth.userId;

  return (
    <nav className="w-full bg-white shadow-sm">
      {/* Desktop Menu */}
      <div className="hidden lg:flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h3 className="font-Montserrat font-semibold text-3xl">Bandage</h3>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full px-4 py-2 pl-8 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </form>

          {isSearchFocused && (searchResults.length > 0 || isLoading) && (
            <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{product.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
 {/* Navigation Links */}
 <ul className="flex items-center gap-6">
        <li><Link href="/" className="text-[18px] font-semibold hover:text-blue-500 transition">Home</Link></li>
        <li><Link href="/Shop" className="text-[18px] font-semibold hover:text-blue-500 transition">Shop</Link></li>
        <li><Link href="/About" className="text-[18px] font-semibold hover:text-blue-500 transition">About</Link></li>
        <li><Link href="/Pages" className="text-[18px] font-semibold hover:text-blue-500 transition">Pages</Link></li>
        <li><Link href="/Pricing" className="text-[18px] font-semibold hover:text-blue-500 transition">Pricing</Link></li>
        <li><Link href="/Contact" className="text-[18px] font-semibold hover:text-blue-500 transition">Contact</Link></li>
      
        </ul>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {!userId ? (
          <>
            <Link href="/sign-in" className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              Login
            </Link>
            <span>/</span>
            <Link href="/sign-up" className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              Register
            </Link>
          </>
        ) : (
          <UserButton />
        )}
      </div>
          <div className="flex items-center gap-4">
            <a href="/cart" className="text-gray-700 hover:text-blue-500 transition-colors">
            <LucideShoppingCart />
            </a>
            <Link href={''} className="text-[24px] text-gray-700  hover:text-blue-500 transition-colors"><FaRegHeart /> </Link>
            <Link href={'/Dashboard'} className="text-[24px] text-gray-700 hover:text-blue-500 transition-colors"><RiDashboardLine /> </Link>
          </div>
      </div>

      {/* Mobile Menu */}
<div className="lg:hidden flex items-center justify-between px-4 py-3">
  {/* Logo */}
  <h3 className="font-Montserrat font-semibold text-xl">Bandage</h3>
  
  {/* Search Bar */}
  <div className="relative flex-1 mx-2">
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full px-3 py-2 pl-8 pr-3 border border-gray-300 rounded-md text-sm"
      />
      <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </form>
  </div>

  {/* Sidebar Toggle Button */}
  <button
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="p-2 focus:outline-none"
  >
    <div className="w-6 h-0.5 bg-gray-900 mb-1.5" />
    <div className="w-6 h-0.5 bg-gray-900 mb-1.5" />
    <div className="w-6 h-0.5 bg-gray-900" />
  </button>

  {/* Sidebar */}
  {isMenuOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-64 bg-white p-6">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-4 right-4"
        >
          <FaTimes className="text-xl" />
        </button>
        <ul className="mt-8 space-y-4">
          <li>
            <Link href="/" className="text-[16px] font-semibold hover:text-blue-500 transition">
              Home
            </Link>
          </li>
          <li>
            <Link href="/Shop" className="text-[16px] font-semibold hover:text-blue-500 transition">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/About" className="text-[16px] font-semibold hover:text-blue-500 transition">
              About
            </Link>
          </li>
          <li>
            <Link href="/Pages" className="text-[16px] font-semibold hover:text-blue-500 transition">
              Pages
            </Link>
          </li>
          <li>
            <Link href="/Pricing" className="text-[16px] font-semibold hover:text-blue-500 transition">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/Contact" className="text-[16px] font-semibold hover:text-blue-500 transition">
              Contact
            </Link>
          </li>
        </ul>
         {/* User Actions */}
      <div className="flex items-center gap-4">
        {!userId ? (
          <>
            <Link href="/sign-in" className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              Login
            </Link>
            <span>/</span>
            <Link href="/sign-up" className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              Register
            </Link>
          </>
        ) : (
          <UserButton />
        )}
      </div>
          <div className="flex items-center gap-4">
            <a href="/cart" className="text-gray-700 hover:text-blue-500 transition-colors">
            <LucideShoppingCart />
            </a>
            <Link href={''} className="text-[24px] text-gray-700  hover:text-blue-500 transition-colors"><FaRegHeart /> </Link>
            <Link href={'/Dashboard'} className="text-[24px] text-gray-700 hover:text-blue-500 transition-colors"><RiDashboardLine /> </Link>
          </div>
      </div>
      </div>
   
  )}
</div>
</nav>

  );
};

export default Navbar;
