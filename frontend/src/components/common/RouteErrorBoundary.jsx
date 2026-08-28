import React from "react";
import { useRouteError, isRouteErrorResponse, Link, useNavigate } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button.jsx";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading this view. Your session data is intact.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page or resource you are looking for does not exist or has been relocated.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white border border-border shadow-lg space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-2xs">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-text-primary tracking-tight">{title}</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">{message}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="text-xs font-semibold"
          >
            Go Back
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => window.location.reload()}
            className="text-xs font-semibold"
          >
            Reload
          </Button>

          <Link to="/">
            <Button
              variant="primary"
              size="sm"
              icon={Home}
              className="text-xs font-bold shadow-xs"
            >
              Home Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
