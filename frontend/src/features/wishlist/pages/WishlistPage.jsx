import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { EmptyState } from "../../../components/ui/Alert.jsx";
import { ROUTES } from "../../../constants/routes.js";

export function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Saved Wishlist</h1>
      </div>

      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save your favorite growing media and foliage here to track seasonal availability."
        action={
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="primary" size="sm">
              Discover Catalog
            </Button>
          </Link>
        }
      />
    </div>
  );
}
