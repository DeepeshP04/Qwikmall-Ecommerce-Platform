import './FilterOption.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function FilterOption ({title, options, selectedOptions = [], onOptionToggle}) {
    const [isExpanded, setIsExpanded] = useState(true);
    let filterId = title.toLowerCase().replace(/\s+/g, '-');

    const handleOptionChange = (option) => {
        onOptionToggle(option);
    };

    const isOptionSelected = (option) => {
        return selectedOptions.includes(option);
    };

    return (
        <div className='filter-block'>
            <div 
                className="filter-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h4 className="filter-title">{title}</h4>
                <FontAwesomeIcon 
                    icon={faAngleDown} 
                    className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}
                />
            </div>
            <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
                {options.map((option, idx) => (
                    <div className="filter-option-item" key={`${filterId}-${idx}`}>
                        <input 
                            type="checkbox" 
                            id={`${filterId}-${option}`}
                            checked={isOptionSelected(option)}
                            onChange={() => handleOptionChange(option)}
                        />
                        <label htmlFor={`${filterId}-${option}`}>
                            {option}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FilterOption;