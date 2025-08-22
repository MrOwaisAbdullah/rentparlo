import { Suspense } from "react"
import { SearchPageContent } from "@/components/pages/search-page-content"

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
