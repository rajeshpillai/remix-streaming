import { useState, Suspense, use } from "react";
import { useLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/node";

import styles from "../../styles/global.css";

const fetchProducts = async () => {
  const resp = await fetch('https://fakestoreapi.com/products');
  const products = await resp.json();
  return products;
}

const fetchDescription = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve("Critical information ready for SEO to be rendered on landing"), 100)
  );

const commentsFetch = async () => {
  await new Promise((res) => setTimeout(res, 3000));
  const resp = await fetch('https://jsonplaceholder.typicode.com/users/1/todos');
  const todos = await resp.json();
  return todos;
  
}
  
const relatedProductsFetch = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve(["Product 1", "Product 2", "Product 3"]), 2000)
  );

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export async function loader() {
  const description = await fetchDescription();
  const products = await fetchProducts();
  const comments = commentsFetch() as Promise<string[]>;
  const relatedProducts = relatedProductsFetch() as Promise<string[]>;

  return defer({
    products,
    description,
    comments,
    relatedProducts
  });
}

function Comments({ comments: commentsPromise }) {
  const [comments, setComments] = useState<string[]>(use(commentsPromise));

  return (
    <div>
      <ul className="list-disc">
        {comments.map((comment) => (
          <li key={comment.id}>{comment.title}</li>
        ))}
      </ul>
    </div>
  );
}

function RelatedProducts({ products: productsPromise }: { products: string[] }) {
  const [products, _] = useState<string[]>(use(productsPromise));

  return (
    <div>
      <ul className="list-disc">
        {products.map((product) => (
          <li key={product}>{product}</li>
        ))}
      </ul>
    </div>
  );
}

function ProductList({products}) {
  return (
    <div className="flex flex-wrap">
      {products.map((p, index) => {
        return (
          <div key={index} className="flex-none w-1/4 p-4">
            <div className="bg-white rounded-lg shadow-lg">
              <figure className="w-full h-48">
                <img className="w-full h-full object-cover rounded-t-lg" src={p.image} alt={p.title} />
              </figure>

              <div className="p-4">
                <div className="font-semibold text-lg mb-2">{p.title}</div>
                <div className="text-gray-600 text-sm mb-1">{p.category}</div>
                <div className="text-gray-600 text-sm mb-2">{p.description}</div>
                <div className="font-bold text-xl">${p.price}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


export default function Index() {
  const { products, description, comments, relatedProducts } = useLoaderData();

  return (
    <div>
      <header className="mb-4">React Streaming</header>

      <div className="flex">
        {/* Left side: Product List */}
        <div className="w-3/5 pr-4">
          <h2 className="mb-2">Product Description</h2>
          <p className="mb-4">{description}</p>
          <ProductList products={products} />
        </div>

        {/* Right side: Comments and Related Products */}
        <div className="w-2/5 pl-4">
          <h2 className="prose mb-2">Feedback</h2>
          <Suspense fallback={<div>Loading feedback...</div>}>
            <Comments comments={comments} />
          </Suspense>

          <h2 className="prose mt-8 mb-2">Related Products</h2>
          <Suspense fallback={<div>Loading related products...</div>}>
            <RelatedProducts products={relatedProducts} />
          </Suspense>
        </div>
      </div>

      <footer className="mt-4">Non critical data loaded via server</footer>
    </div>
  );
}

