import FilterOption from './FilterOption'
import './FilterPanel.css'

function FilterPanel ( {filters}) {
    return (
        <div className="filter-panel">
            {filters.map((filter) => (
                <FilterOption key={filter.id} title={filter.title} options={filter.options}>
                </FilterOption>
            ))}
        </div>
    )
}

export default FilterPanel;