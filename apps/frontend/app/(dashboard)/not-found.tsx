import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex gap-4">
        <Button 
          asChild
          variant="outline"
        >
          <Link href="javascript:history.back()" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
        </Button>
        <Button 
          asChild
        >
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}