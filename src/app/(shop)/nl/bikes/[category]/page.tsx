import { notFound } from 'next/navigation'
import Catalog from '../../../../../components/plp/Catalog/Catalog'
import { CATEGORIES, getCategory } from '../../../../../data/categories'

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategory((await params).category)
  return { title: category ? `${category.title} | Giant` : 'Not found' }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategory((await params).category)
  if (!category) notFound()
  return <Catalog category={category} />
}
