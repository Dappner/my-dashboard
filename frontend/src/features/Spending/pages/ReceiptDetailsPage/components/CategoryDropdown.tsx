import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryIcon } from "@/features/Spending/components/ReceiptCard";
import { useSpendingCategories } from "@/features/Spending/hooks/useSpendingCategories";

interface CategoryDropdownProps {
  currentCategoryId: string | null;
  itemId: string;
  onCategoryChange: (itemId: string, categoryId: string | null) => void;
}

export function CategoryDropdown({
  currentCategoryId,
  itemId,
  onCategoryChange,
}: CategoryDropdownProps) {
  const { data: categories = [] } = useSpendingCategories();

  // Get the current category name from ID
  const getCurrentCategoryName = () => {
    if (!currentCategoryId) return "Uncategorized";
    if (currentCategoryId === undefined) return "Uncategorized";

    const category = categories.find((cat) => cat.id === currentCategoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <Select
      value={currentCategoryId || "uncategorized"}
      onValueChange={(value) => {
        const categoryId = value === "uncategorized" ? null : value;
        onCategoryChange(itemId, categoryId);
      }}
    >
      <SelectTrigger className="max-w-40 h-7 text-xs">
        <SelectValue>{getCurrentCategoryName()}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="uncategorized">
          {getCategoryIcon("Uncategorized")}
          Uncategorized
        </SelectItem>

        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {getCategoryIcon(category.name)}
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
