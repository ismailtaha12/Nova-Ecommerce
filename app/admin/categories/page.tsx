import { categories } from "@/lib/data";
import { products } from "@/lib/data";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Categories</h1>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <li key={c.slug} className="flex items-center justify-between py-5">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <p className="text-sm tabular-nums text-muted-foreground">{count} products</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
