import FilterOption from './FilterOption'
import './FilterPanel.css'
import { useState } from 'react';

function FilterPanel ({filters, onFilterChange}) {
    const [selectedFilters, setSelectedFilters] = useState({});

    const handleFilterToggle = (filterType, option) => {
        setSelectedFilters(prev => {
            const current = prev[filterType] || [];
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            
            const newFilters = {
                ...prev,
                [filterType]: updated
            };
            
            // Call parent callback with updated filters
            onFilterChange(newFilters);
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({});
        onFilterChange({});
    };

    // Convert backend data format to filter components
    const renderFilters = () => {
        if (!filters || typeof filters !== 'object') {
            return <p className="no-filters">No filters available</p>;
        }

        return Object.entries(filters).map(([filterType, options]) => (
            <FilterOption 
                key={filterType}
                title={filterType} 
                options={options}
                selectedOptions={selectedFilters[filterType] || []}
                onOptionToggle={(option) => handleFilterToggle(filterType, option)}
            />
        ));
    };

    return (
        <div className="filter-panel">
            <div className="filter-header-section">
                <h3>Filters</h3>
                {Object.keys(selectedFilters).some(key => selectedFilters[key].length > 0) && (
                    <button 
                        className="clear-filters-btn"
                        onClick={clearAllFilters}
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            {renderFilters()}
        </div>
    )
}

export default FilterPanel;