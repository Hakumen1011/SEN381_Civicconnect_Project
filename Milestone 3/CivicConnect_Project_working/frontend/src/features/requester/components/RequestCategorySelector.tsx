import type { CategoryOption } from "../requesterData";
import "./RequestCategorySelector.css";

interface RequestCategorySelectorProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function RequestCategorySelector({
  categories,
  selectedCategory,
  onCategorySelect,
}: RequestCategorySelectorProps) {
  return (
    <div className="request-category-grid">
      {categories.map((category) => {
        const selected =
          category.id === selectedCategory;

        return (
          <button
            key={category.id}
            type="button"
            className={`request-category-card ${
              selected
                ? "request-category-card--selected"
                : ""
            }`}
            onClick={() =>
              onCategorySelect(category.id)
            }
            aria-pressed={selected}
          >
            <span className="request-category-card__icon">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                {category.icon}
              </span>
            </span>

            <span className="request-category-card__label">
              {category.label}
            </span>

            <span className="request-category-card__description">
              {category.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}