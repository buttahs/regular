# My Regulars

A personal supermarket price and offer tracker for the products you actually buy.

## Current status

This is the GitHub Pages-ready interface. It:

- keeps a personal basket in browser storage;
- compares Tesco, Sainsbury’s, Waitrose and Asda;
- separates standard prices from loyalty prices;
- lets you enable Nectar and Clubcard;
- recalculates the cheapest single-shop and split-shop baskets.

The supplied data is illustrative, except the Sainsbury’s What the Cluck prices confirmed on 28 July 2026:

- standard price: £3.15;
- Nectar price: £2.50.

## Put it on GitHub

1. Create a new empty GitHub repository, for example `my-regulars`.
2. Upload the contents of this folder—not the containing folder.
3. Commit to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. The included workflow will publish the site.

## Update products and prices

Edit `data/products.json`. Each retailer listing supports:

```json
{
  "standard": 3.15,
  "loyalty": 2.50,
  "scheme": "Nectar"
}
```

Use `null` for `loyalty` and `scheme` when there is no loyalty offer.

## Next development step

Add a scheduled price collector that updates `data/products.json` and writes historical snapshots. Start with one Sainsbury’s product page and prove that standard and Nectar prices can be collected reliably before adding the other supermarkets.
