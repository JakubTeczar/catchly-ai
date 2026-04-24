"use client";

import { ShoppingBag, Wrench, ExternalLink } from "lucide-react";
import type { ProductsData, ProductItem } from "@/types/analysis";
import { ScannerBar } from "./ScannerBar";

interface Props {
  productsData: ProductsData | null;
  done: boolean;
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-12 h-12 rounded-lg object-cover shrink-0"
          style={{ background: "rgba(255,255,255,0.06)" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <ShoppingBag className="w-5 h-5" style={{ color: "rgba(255,255,255,0.2)" }} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-white truncate"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          {product.name}
        </p>
        {product.price && (
          <p
            className="text-sm mt-0.5"
            style={{ color: "#BBEA00", fontFamily: "Satoshi, sans-serif", fontWeight: 600 }}
          >
            {product.price}
          </p>
        )}
      </div>

      {product.pageUrl && (
        <a
          href={product.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

function ServiceCard({ product }: { product: ProductItem }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: "rgba(187,234,0,0.03)",
        border: "1px solid rgba(187,234,0,0.08)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(187,234,0,0.08)" }}
      >
        <Wrench className="w-3.5 h-3.5" style={{ color: "#BBEA00" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-white"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          {product.name}
        </p>
        {product.price && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgba(187,234,0,0.7)", fontFamily: "Satoshi, sans-serif" }}
          >
            {product.price}
          </p>
        )}
      </div>
    </div>
  );
}

export function ProductsSection({ productsData, done }: Props) {
  const isProduct = productsData?.businessType === "product";
  const products = productsData?.products ?? [];

  let sectionTitle = "";
    if (!done) {
      sectionTitle = "Analizuję ofertę. To może chwilę potrwać... (20-50s)";
    } else if (products.length === 0) {
      sectionTitle = "Zakończyłem analizę oferty";
    } else {
      sectionTitle = isProduct
        ? "Zidentyfikowałem produkty w Twojej ofercie"
        : "Zidentyfikowałem strukturę Twojej oferty";
    }

  return (
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <ScannerBar active={!done} />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" style={{ color: "#BBEA00" }} />
          <h2
            className="text-base font-medium text-white"
            style={{ fontFamily: "Brockmann, sans-serif" }}
          >
            {sectionTitle}
          </h2>
          {done && products.length > 0 && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(187,234,0,0.08)",
                border: "1px solid rgba(187,234,0,0.15)",
                color: "rgba(187,234,0,0.7)",
                fontFamily: "Satoshi, sans-serif",
              }}
            >
              {isProduct ? "sklep" : "usługi"}
            </span>
          )}
        </div>

        {!done ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg animate-pulse shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-3.5 w-40 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div
                    className="h-3 w-16 rounded animate-pulse"
                    style={{ background: "rgba(187,234,0,0.08)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <></>
        ) : (
          <div className="space-y-2">
            {products.map((p, i) =>
              isProduct ? (
                <ProductCard key={i} product={p} />
              ) : (
                <ServiceCard key={i} product={p} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
