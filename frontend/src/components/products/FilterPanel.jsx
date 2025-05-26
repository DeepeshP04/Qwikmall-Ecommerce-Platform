import FilterOption from './FilterOption'
import './FilterPanel.css'

function FilterPanel () {
    return (
        <div className="filter-panel">
            <FilterOption title="Size" options={["XL", "2XL"]} filterId="size"></FilterOption>
            <FilterOption title="Color" options={["Green", "Red", "Black", "Blue"]} filterId="color"></FilterOption>
        </div>
    )
}

export default FilterPanel;