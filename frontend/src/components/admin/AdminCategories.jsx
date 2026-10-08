import { useState } from 'react';

function AdminCategories({ request, searchQuery, categories, onCategoriesChange }) {
    const [categoryName, setCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function createCategory(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            await request('categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName }),
            });
            setCategoryName('');
            onCategoriesChange(await request('categories'));
        } catch (saveError) {
            setError(saveError.message || 'Unable to add category.');
        } finally {
            setSaving(false);
        }
    }

    async function saveCategory(categoryId) {
        setSaving(true);
        setError('');
        try {
            await request(`categories/${categoryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName }),
            });
            setEditingId(null);
            setEditingName('');
            onCategoriesChange(await request('categories'));
        } catch (saveError) {
            setError(saveError.message || 'Unable to update category.');
        } finally {
            setSaving(false);
        }
    }

    async function deleteCategory(category) {
        if (!window.confirm(`Delete the "${category.name}" category?`)) return;
        setError('');
        try {
            await request(`categories/${category.id}`, { method: 'DELETE' });
            onCategoriesChange(await request('categories'));
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to delete category.');
        }
    }

    const query = searchQuery.trim().toLocaleLowerCase();
    const filteredCategories = categories.filter((category) => (
        `${category.name} ${category.product_count}`.toLocaleLowerCase().includes(query)
    ));

    return (
        <section className="admin-orders-panel admin-management-panel">
            <div className="admin-panel-heading">
                <div><h2>Categories</h2><p>Organize products into named categories. Categories with products cannot be deleted.</p></div>
                <span>{filteredCategories.length} categories</span>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <form className="admin-inline-form" onSubmit={createCategory}>
                <label>
                    Category name
                    <input required maxLength="50" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Home & Living" />
                </label>
                <button className="admin-primary-action" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add category'}</button>
            </form>
            {filteredCategories.length ? (
                <div className="admin-table-wrap">
                    <table>
                        <thead><tr><th>Category</th><th>Products</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        {editingId === category.id ? (
                                            <input
                                                className="admin-table-input"
                                                aria-label={`Category name for ${category.name}`}
                                                maxLength="50"
                                                value={editingName}
                                                onChange={(event) => setEditingName(event.target.value)}
                                            />
                                        ) : category.name}
                                    </td>
                                    <td>{category.product_count}</td>
                                    <td>
                                        <div className="admin-table-actions">
                                            {editingId === category.id ? (
                                                <>
                                                    <button className="admin-small-action" type="button" disabled={saving} onClick={() => saveCategory(category.id)}>Save</button>
                                                    <button className="admin-small-action" type="button" onClick={() => { setEditingId(null); setEditingName(''); }}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="admin-small-action" type="button" onClick={() => { setEditingId(category.id); setEditingName(category.name); }}>Rename</button>
                                                    <button className="admin-small-action admin-danger-action" type="button" onClick={() => deleteCategory(category)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p className="admin-empty-state">{query ? 'No categories match your search.' : 'No categories yet. Add your first category above.'}</p>}
        </section>
    );
}

export default AdminCategories;
