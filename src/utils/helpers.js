// Format a date string to a readable format
export const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatCurrency = (amount, currency = 'ETB') => {
    // Use Br symbol for Ethiopian Birr
    const symbol = currency === 'ETB' ? 'Br' : currency;
    return `${symbol} ${Number(amount).toLocaleString()}`;
};

export const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'status-active';
        case 'SUSPENDED': return 'status-suspended';
        case 'TERMINATED': return 'status-terminated';
        case 'SUCCESS': return 'status-active';
        case 'FAILED': return 'status-terminated';
        case 'PENDING': return 'status-pending';
        default: return 'status-default';
    }
};

export const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
