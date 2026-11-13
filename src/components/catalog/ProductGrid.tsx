import { catalogProducts } from '../../data/catalog-products'
import ProductCard from './ProductCard'

export default function ProductGrid({ storeName }: { storeName?: string }) {
  return (
    <section className="products-area" aria-label="Products">
      <div className="products-grid">
        {catalogProducts.map((product) => (
          <ProductCard key={product.id} product={product} storeName={storeName} />
        ))}
      </div>
    </section>
  )
}
