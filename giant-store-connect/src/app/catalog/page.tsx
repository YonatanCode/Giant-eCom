import Footer from '../../components/Footer'
import CatalogHeader from '../../components/catalog/CatalogHeader'
import FiltersPanel from '../../components/catalog/FiltersPanel'
import ProductGrid from '../../components/catalog/ProductGrid'
import { catalogProducts } from '../../data/catalog-products'
import { getStore } from '../../data/store'

// Store-pinned Mountain-bike catalog. ?store=<slug> pins the page to a store:
// the filter panel shows it as the "Available near me" chip and every card reads
// "Available at <store name>". Invalid/missing slug → page renders without the pin.
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>
}) {
  const { store: slug } = await searchParams
  const storeName = getStore(slug)?.name

  return (
    <div className="catalog-page">
      <div className="container mx-auto w-full !max-w-page px-(--layout-page-padding)">
        <CatalogHeader count={catalogProducts.length} />
        <section className="search-page__content" aria-label="Product listing">
          <FiltersPanel storeName={storeName} />
          <ProductGrid storeName={storeName} />
        </section>
      </div>
      <Footer />
    </div>
  )
}
