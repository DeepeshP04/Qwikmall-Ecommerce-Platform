import './FilterOption.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

function FilterOption () {
    return (
        <div className='filter-block'>
            <div className="filter-header">
                <h4 className="filter-title">Size</h4>
                <FontAwesomeIcon icon={faAngleDown} className='toggle-icon'/>
            </div>
            <div className="filter-content">
                <div className="filter-option-item">
                    <input type="checkbox" id="size-2xl"></input>
                    <label htmlFor='size-2xl'>2XL</label>
                </div>
                <div className="filter-option-item">
                    <input type="checkbox" id="size-2xl"></input>
                    <label htmlFor='size-2xl'>2XL</label>
                </div>
            </div>
        </div>
    )
}
export default FilterOption;