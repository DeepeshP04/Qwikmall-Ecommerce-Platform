import './FilterOption.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

function FilterOption ({title, options}) {
    let filterId = title.toLowerCase()

    return (
        <div className='filter-block'>
            <div className="filter-header">
                <h4 className="filter-title">{title}</h4>
                <FontAwesomeIcon icon={faAngleDown} className='toggle-icon'/>
            </div>
            <div className="filter-content">
                {options.map((option, idx) => (
                    <div className="filter-option-item" key={`${filterId}-${idx}`}>
                        <input type="checkbox" id={`${filterId}-${option}`}></input>
                        <label htmlFor={`${filterId}-${option}`}>{option}</label>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default FilterOption;