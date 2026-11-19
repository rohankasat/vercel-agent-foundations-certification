"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductDetailsToolInvocation } from "@/lib/agent";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({
  invocation,
}: AgentProductCardProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    return (
      <div
        role="status"
        className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
      >
        Looking up product
        {invocation.input?.productId
          ? ` "${invocation.input.productId}"`
          : ""}
        …
      </div>
    );
  }

  if (invocation.state === "output-error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        Unable to load this product. Please try again.
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if (!output.product) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        {output.error ?? "Product not found."}
      </div>
    );
  }

  const product = output.product;
  const image = product.images?.[0];
  const tags = product.tags ?? [];
  const sizes = product.sizes ?? [];

  return (
    <article className="max-w-lg overflow-hidden rounded-lg border border-border bg-card">
      {image && (
        <div className="relative aspect-[4/3] bg-secondary">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-contain"
          />
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight">
            {product.name}
          </h3>

          <p className="shrink-0 text-sm font-medium">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        {product.description && (
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {sizes.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Sizes</p>

            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-md border border-border px-2 py-1 text-xs"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {output.stockError && (
          <p role="status" className="text-sm text-muted-foreground">
            Live availability could not be verified.
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {product.slug && (
          <Link
            href={`/products/${encodeURIComponent(product.slug)}`}
            className="inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            View product →
          </Link>
        )}
      </div>
    </article>
  );
}