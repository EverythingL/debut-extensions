// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const discountGroups = [];
  const targets = input.cart.lines
    .filter(line => { return line.item_byob?.value })
    .map(line => {
      return ({
        cartLine: { id: line.id },
        discountValue: line.item_byob?.value
      });
    });

  // collect all unique discount values across targets
  const discountValues = new Set([...targets.map(target => target.discountValue)]);

  if (!discountValues.size) {
    console.error("No cart lines qualify for BYOB discount.");
    return EMPTY_DISCOUNT;
  }

  // collect items into groups united by discountValue
  Array.from(discountValues).forEach(discountValue => {
    const discountTargets = targets
      .filter(target => { return (target.discountValue === discountValue) })
      .map(target => { return { cartLine: target.cartLine }})

    if (discountGroups.find(item => item.value.percentage === discountValue)) return;

    discountGroups.push({
      targets: discountTargets,
      value: {
        percentage: {
          value: discountValue
        }
      },
      message: `Build Your Own Bundle - ${discountValue}% Off`
    })
  })

  return {
    discounts: discountGroups,
    discountApplicationStrategy: DiscountApplicationStrategy.All,
  };
}
