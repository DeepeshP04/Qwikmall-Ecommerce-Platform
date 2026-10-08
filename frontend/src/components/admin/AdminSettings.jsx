import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS = {
    store: { business_name: 'QwikMall', logo_url: '', phone: '', email: '', address: '' },
    payment: { cod_enabled: true, upi_enabled: true, card_enabled: true, razorpay_enabled: false },
    delivery: { enabled: true, shipping_fee: 40, free_shipping_threshold: null, serviceable_postal_codes: [] },
    account: { low_stock_threshold: 5 },
};
const SETTING_SECTIONS = [
    ['store', 'Store'],
    ['payment', 'Payment'],
    ['delivery', 'Delivery'],
    ['account', 'Account'],
];

function AdminSettings({ request, profile, initialSettings, onSettingsChange }) {
    const [settings, setSettings] = useState(() => ({
        ...DEFAULT_SETTINGS,
        ...Object.fromEntries(Object.entries(initialSettings || {}).map(([section, values]) => [
            section,
            { ...DEFAULT_SETTINGS[section], ...values },
        ])),
    }));
    const [activeTab, setActiveTab] = useState('store');
    const [postalCodeInput, setPostalCodeInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const merged = Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([section, defaults]) => [
            section,
            { ...defaults, ...(initialSettings?.[section] || {}) },
        ]));
        setSettings(merged);
        setPostalCodeInput((merged.delivery.serviceable_postal_codes || []).join('\n'));
    }, [initialSettings]);

    function updateField(section, field, value) {
        setSettings((current) => ({
            ...current,
            [section]: { ...current[section], [field]: value },
        }));
        setSaved(false);
    }

    async function saveSettings(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);
        const payload = {
            [activeTab]: { ...settings[activeTab] },
        };
        if (activeTab === 'delivery') {
            payload.delivery.serviceable_postal_codes = postalCodeInput
                .split(/[\n,]/)
                .map((code) => code.trim())
                .filter(Boolean);
        }
        try {
            const updated = await request('settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setSettings((current) => ({ ...current, ...updated }));
            onSettingsChange(updated);
            if (activeTab === 'delivery') {
                setPostalCodeInput((updated.delivery.serviceable_postal_codes || []).join('\n'));
            }
            setSaved(true);
        } catch (saveError) {
            setError(saveError.message || 'Unable to save settings.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="admin-orders-panel admin-settings-panel">
            <div className="admin-panel-heading">
                <div><h2>Store settings</h2><p>Configure your store details, accepted payments, delivery coverage, and account preferences.</p></div>
            </div>
            <nav className="admin-settings-tabs" aria-label="Settings subsections">
                {SETTING_SECTIONS.map(([section, label]) => (
                    <button
                        key={section}
                        type="button"
                        className={activeTab === section ? 'is-active' : ''}
                        aria-current={activeTab === section ? 'page' : undefined}
                        onClick={() => { setActiveTab(section); setSaved(false); setError(''); }}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            <form className="admin-management-form" onSubmit={saveSettings}>
                {activeTab === 'store' && (
                    <div className="admin-form-grid">
                        <label>Business name<input required maxLength="100" value={settings.store.business_name} onChange={(event) => updateField('store', 'business_name', event.target.value)} /></label>
                        <label>Logo URL<input type="text" maxLength="500" placeholder="https://example.com/logo.png" value={settings.store.logo_url} onChange={(event) => updateField('store', 'logo_url', event.target.value)} /></label>
                        <label>Business phone<input type="tel" maxLength="20" value={settings.store.phone} onChange={(event) => updateField('store', 'phone', event.target.value)} /></label>
                        <label>Business email<input type="email" maxLength="120" value={settings.store.email} onChange={(event) => updateField('store', 'email', event.target.value)} /></label>
                        <label className="admin-form-full-width">Business address<textarea maxLength="500" value={settings.store.address} onChange={(event) => updateField('store', 'address', event.target.value)} /></label>
                    </div>
                )}
                {activeTab === 'payment' && (
                    <div className="admin-setting-options">
                        <p>Choose the payment options customers can use at checkout. Payment credentials are managed securely through server environment variables.</p>
                        {[
                            ['razorpay_enabled', 'Razorpay', 'Online payments through your configured Razorpay account.'],
                            ['cod_enabled', 'Cash on Delivery', 'Collect payment when the order is delivered.'],
                            ['upi_enabled', 'UPI', 'Allow UPI as a checkout payment method.'],
                            ['card_enabled', 'Debit / Credit card', 'Allow card payments at checkout.'],
                        ].map(([field, label, description]) => (
                            <label className="admin-toggle-row" key={field}>
                                <span><strong>{label}</strong><small>{description}</small></span>
                                <input type="checkbox" checked={settings.payment[field]} onChange={(event) => updateField('payment', field, event.target.checked)} />
                            </label>
                        ))}
                        <p className="admin-setting-note">Razorpay secret keys are never stored or displayed in the admin dashboard. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.</p>
                    </div>
                )}
                {activeTab === 'delivery' && (
                    <div className="admin-form-grid">
                        <label className="admin-toggle-row admin-form-full-width">
                            <span><strong>Delivery available</strong><small>Turn off to prevent new orders from being delivered.</small></span>
                            <input type="checkbox" checked={settings.delivery.enabled} onChange={(event) => updateField('delivery', 'enabled', event.target.checked)} />
                        </label>
                        <label>Delivery charge (₹)<input type="number" min="0" max="1000000" step="0.01" required value={settings.delivery.shipping_fee} onChange={(event) => updateField('delivery', 'shipping_fee', event.target.value === '' ? '' : Number(event.target.value))} /></label>
                        <label>Free delivery for orders over (₹)<span className="admin-field-help">Leave blank to always charge the delivery fee.</span><input type="number" min="0" max="1000000" step="0.01" value={settings.delivery.free_shipping_threshold ?? ''} onChange={(event) => updateField('delivery', 'free_shipping_threshold', event.target.value === '' ? null : Number(event.target.value))} /></label>
                        <label className="admin-form-full-width">Serviceable postal codes<textarea placeholder="One postal code per line. Leave empty to deliver to all locations." value={postalCodeInput} onChange={(event) => { setPostalCodeInput(event.target.value); setSaved(false); }} /></label>
                    </div>
                )}
                {activeTab === 'account' && (
                    <div className="admin-account-settings">
                        <div className="admin-account-summary">
                            <strong>{profile?.username || 'Administrator'}</strong>
                            <span>{profile?.email || 'No email on file'}</span>
                            <span>{profile?.phone || 'No phone on file'}</span>
                        </div>
                        <label className="admin-setting-field">
                            Low-stock alert threshold
                            <span>Products with this quantity or fewer will be marked as low stock.</span>
                            <input type="number" min="0" max="1000000" step="1" value={settings.account.low_stock_threshold} onChange={(event) => updateField('account', 'low_stock_threshold', event.target.value === '' ? '' : Number(event.target.value))} />
                        </label>
                        <p className="admin-setting-note">Update your administrator name and contact details from the Profile section. Never add payment secrets to your profile.</p>
                    </div>
                )}
                {error && <p className="admin-error" role="alert">{error}</p>}
                <button className="admin-primary-action" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : `Save ${SETTING_SECTIONS.find(([section]) => section === activeTab)?.[1].toLowerCase()} settings`}
                </button>
                {saved && <p className="admin-success-message" role="status">Settings saved successfully.</p>}
            </form>
        </section>
    );
}

export default AdminSettings;
