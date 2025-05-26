import './FilterOption.css'

function FilterOption () {
    return (
        <div className="filter-option">
            <h3 className="filter-option-name">Size</h3>
            <FontAwesomeIcon icon={faAngleDown} className='toggle-options'/>
            <div className="filter-options">
                <div id="option-1">
                    <input type="checkbox"></input>
                    <p>2XL</p>
                </div>
            </div>
        </div>
    )
}
export default FilterOption;