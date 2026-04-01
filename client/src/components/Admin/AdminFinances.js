import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import AdminLayout from './AdminLayout';
import './AdminFinances.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import {
    normalizeFinanceLocation,
    financeLocationAggregationKey,
    PEOPLES_YOGA_NE,
    PEOPLES_YOGA_SE,
    YOGA_REFUGE_NW,
    YOGA_REFUGE_SE,
    THE_PRACTICE_SPACE,
    YOGA_RIOT,
} from '../../utils/normalizeFinanceLocation';
import { buildLocationFinanceReport } from '../../utils/locationFinanceReport';
import {
    getOneWayMilesForLocation,
    DEFAULT_TUCSON_HYBRID_MPG,
    DEFAULT_GAS_PRICE_PER_GALLON,
    isOnlineCanonicalLocation,
    readLegacyLocationMiles,
    readLegacyTravelSettings,
    clearLegacyFinanceTravelLocalStorage,
} from '../../utils/financeLocationTravel';
import { computeTripMilesAndGasForRow } from '../../utils/financeTripCompute';

function sortClassData(data) {
    return [...data].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
    });
}

function groupDataByMonth(data) {
    const grouped = {};
    data.forEach((entry) => {
        const [year, month, day] = entry.date.split('-');
        const date = new Date(year, month - 1, day);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                name: monthName,
                entries: [],
                yogaTeachingCount: 0,
                yogaTherapyCount: 0,
            };
        }
        grouped[monthKey].entries.push(entry);
        if (entry.category === 'yoga teaching') grouped[monthKey].yogaTeachingCount += 1;
        if (entry.category === 'yoga therapy') grouped[monthKey].yogaTherapyCount += 1;
    });

    return grouped;
}

const AdminFinances = () => {
    const LOCATION_PRESETS = [
        { id: 'bhakti', label: 'The Bhakti Yoga Movement Center', location: 'The Bhakti Yoga Movement Center' },
        { id: 'blhc', label: 'BLHC', location: 'BLHC' },
        { id: 'dear', label: 'Dear Yoga', location: 'Dear Yoga' },
        { id: 'danner-boots', label: 'Danner Boots', location: 'Danner Boots' },
        { id: 'firelight', label: 'Firelight Yoga', location: 'Firelight Yoga' },
        { id: 'fullbodied', label: 'Full Bodied Yoga', location: 'Full Bodied Yoga' },
        { id: 'yoga-refuge-nw', label: YOGA_REFUGE_NW, location: YOGA_REFUGE_NW },
        { id: 'yoga-refuge-se', label: YOGA_REFUGE_SE, location: YOGA_REFUGE_SE },
        { id: 'peoples-yoga-ne', label: PEOPLES_YOGA_NE, location: PEOPLES_YOGA_NE },
        { id: 'peoples-yoga-se', label: PEOPLES_YOGA_SE, location: PEOPLES_YOGA_SE },
        { id: 'heartspring', label: 'Heart Spring Health', location: 'Heart Spring Health' },
        { id: 'practice-space', label: THE_PRACTICE_SPACE, location: THE_PRACTICE_SPACE },
        { id: 'ready-set-grow', label: 'Ready Set Grow', location: 'Ready Set Grow' },
        { id: 'yoga-riot', label: YOGA_RIOT, location: YOGA_RIOT },
        { id: 'online', label: 'Online', location: 'Online' },
        { id: 'other', label: 'Other (new location)', location: '' },
    ];
    const [classData, setClassData] = useState([]);
    const [expandedYears, setExpandedYears] = useState(() => new Set());
    const [expandedMonths, setExpandedMonths] = useState(new Set());
    const [driveByLocationOpen, setDriveByLocationOpen] = useState(false);
    const expandedYearsRef = useRef(expandedYears);
    expandedYearsRef.current = expandedYears;
    const financesYearExpansionInitRef = useRef(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [selectedEntries, setSelectedEntries] = useState(new Set());
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        category: '',
        paid: '',
        taxed: '',
        paymentMethod: ''
    });
    const [locationStatsCanonical, setLocationStatsCanonical] = useState(null);
    const [travelSettings, setTravelSettings] = useState(() => ({
        mpg: DEFAULT_TUCSON_HYBRID_MPG,
        gasPricePerGallon: DEFAULT_GAS_PRICE_PER_GALLON,
    }));
    const [milesOverrides, setMilesOverrides] = useState(() => ({}));
    const [statsMilesDraft, setStatsMilesDraft] = useState('');
    const [statsMpgDraft, setStatsMpgDraft] = useState('');
    const [statsGasDraft, setStatsGasDraft] = useState('');
    const [newEntry, setNewEntry] = useState({
        date: '',
        time: '',
        class: '',
        location: '',
        locationPreset: '',
        category: 'other',
        grossRate: '',
        receivedRate: '',
        paymentFrequency: 'per-class',
        paymentMethod: 'cash',
        paymentRequestSent: 'no',
        paid: 'no',
        taxed: 'no',
        repeat: 'no',
        repeatCount: 1,
        repeatFrequency: 'weekly'
    });

    const handleLocationPresetChange = (presetId) => {
        const preset = LOCATION_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        setNewEntry((prev) => ({
            ...prev,
            locationPreset: presetId,
            location: presetId === 'other' ? '' : preset.location,
        }));
    };

    const fetchClassData = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminAxiosInstance.get('/api/finances', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                // Convert MongoDB _id to id for frontend compatibility
                const formattedData = response.data.finances.map(entry => ({
                    ...entry,
                    id: entry._id
                }));
                setClassData(sortClassData(formattedData));
            } else {
                console.error('Error fetching finances:', response.data.message);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch finance data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching class data:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to connect to server',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
        }
    }, []);

    const fetchFinanceTravelSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            const response = await adminAxiosInstance.get('/api/finances/travel-settings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.data.success) return;
            let locationMiles = response.data.settings.locationMiles || {};
            let mpg = response.data.settings.mpg;
            let gasPricePerGallon = response.data.settings.gasPricePerGallon;
            const legacyMiles = readLegacyLocationMiles();
            if (Object.keys(locationMiles).length === 0 && Object.keys(legacyMiles).length > 0) {
                locationMiles = { ...legacyMiles };
                await adminAxiosInstance.put(
                    '/api/finances/travel-settings',
                    { locationMiles, mpg, gasPricePerGallon },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setMilesOverrides(
                locationMiles && typeof locationMiles === 'object' ? { ...locationMiles } : {}
            );
            setTravelSettings({
                mpg: typeof mpg === 'number' && mpg > 0 ? mpg : DEFAULT_TUCSON_HYBRID_MPG,
                gasPricePerGallon:
                    typeof gasPricePerGallon === 'number' && gasPricePerGallon >= 0
                        ? gasPricePerGallon
                        : DEFAULT_GAS_PRICE_PER_GALLON,
            });
            clearLegacyFinanceTravelLocalStorage();
        } catch (error) {
            console.error('Error fetching finance travel settings:', error);
            setMilesOverrides(readLegacyLocationMiles());
            setTravelSettings(readLegacyTravelSettings());
        }
    }, []);

    const persistFinanceTravelSettings = useCallback(async (nextMiles, nextTravel) => {
        const token = localStorage.getItem('adminToken');
        const response = await adminAxiosInstance.put(
            '/api/finances/travel-settings',
            {
                locationMiles: nextMiles,
                mpg: nextTravel.mpg,
                gasPricePerGallon: nextTravel.gasPricePerGallon,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to save travel settings');
        }
        const s = response.data.settings;
        setMilesOverrides(s.locationMiles && typeof s.locationMiles === 'object' ? { ...s.locationMiles } : {});
        setTravelSettings({
            mpg: typeof s.mpg === 'number' && s.mpg > 0 ? s.mpg : DEFAULT_TUCSON_HYBRID_MPG,
            gasPricePerGallon:
                typeof s.gasPricePerGallon === 'number' && s.gasPricePerGallon >= 0
                    ? s.gasPricePerGallon
                    : DEFAULT_GAS_PRICE_PER_GALLON,
        });
        clearLegacyFinanceTravelLocalStorage();
        return response.data.settings;
    }, []);

    useEffect(() => {
        fetchClassData();
    }, [fetchClassData]);

    useEffect(() => {
        fetchFinanceTravelSettings();
    }, [fetchFinanceTravelSettings]);

    useEffect(() => {
        if (!locationStatsCanonical) return;
        const miles = getOneWayMilesForLocation(locationStatsCanonical, milesOverrides);
        setStatsMilesDraft(miles == null ? '' : String(miles));
        setStatsMpgDraft(String(travelSettings.mpg));
        setStatsGasDraft(String(travelSettings.gasPricePerGallon));
        // Only re-fill drafts when switching which location is open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationStatsCanonical]);

    const groupedData = useMemo(() => groupDataByMonth(classData), [classData]);

    const { monthsByYear, sortedYears } = useMemo(() => {
        const byYear = new Map();
        Object.entries(groupedData).forEach(([mk, md]) => {
            const y = mk.slice(0, 4);
            if (!byYear.has(y)) byYear.set(y, []);
            byYear.get(y).push([mk, md]);
        });
        byYear.forEach((monthList) => {
            monthList.sort(([ka], [kb]) => ka.localeCompare(kb));
        });
        const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));
        return { monthsByYear: byYear, sortedYears: years };
    }, [groupedData]);

    /** Current calendar year: drive totals + by-location breakdown (same YYYY as summary card labels). */
    const currentYearDriveAggregates = useMemo(() => {
        const summaryYear = new Date().getFullYear();
        const byLoc = new Map();
        let totalMiles = 0;
        let totalGas = 0;

        classData.forEach((entry) => {
            const year = Number((entry.date || '').split('-')[0]);
            if (year !== summaryYear || Number.isNaN(year)) return;
            const loc = financeLocationAggregationKey(entry.location);
            const trip = computeTripMilesAndGasForRow(loc, milesOverrides, travelSettings);
            let m = 0;
            let g = 0;
            if (trip.tripMiles != null && !Number.isNaN(Number(trip.tripMiles))) {
                m = Number(trip.tripMiles);
            }
            if (trip.tripGasCost != null && !Number.isNaN(Number(trip.tripGasCost))) {
                g = Number(trip.tripGasCost);
            }
            totalMiles += m;
            totalGas += g;
            const cur = byLoc.get(loc) || { miles: 0, gas: 0 };
            byLoc.set(loc, { miles: cur.miles + m, gas: cur.gas + g });
        });

        const byLocationSorted = Array.from(byLoc.entries()).sort((a, b) => {
            if (b[1].miles !== a[1].miles) return b[1].miles - a[1].miles;
            return a[0].localeCompare(b[0]);
        });

        return { summaryYear, totalMiles, totalGas, byLocationSorted };
    }, [classData, milesOverrides, travelSettings]);

    useEffect(() => {
        if (loading) return;
        if (classData.length === 0) {
            financesYearExpansionInitRef.current = false;
            setExpandedYears(new Set());
            setExpandedMonths(new Set());
            return;
        }
        if (financesYearExpansionInitRef.current) return;
        financesYearExpansionInitRef.current = true;
        const grouped = groupDataByMonth(classData);
        const cy = String(new Date().getFullYear());
        let openYear = cy;
        if (!Object.keys(grouped).some((k) => k.startsWith(`${openYear}-`))) {
            const allYears = [...new Set(Object.keys(grouped).map((k) => k.slice(0, 4)))].sort((a, b) =>
                b.localeCompare(a)
            );
            if (allYears.length === 0) return;
            openYear = allYears[0];
        }
        setExpandedYears(new Set([openYear]));
        // Months start collapsed; user expands each month to see class rows.
    }, [loading, classData]);

    const calculateMonthlyTotals = (groupedData, expandedMonths) => {
        let totalRevenue = 0;
        let totalClasses = 0;
        const monthNames = [];

        expandedMonths.forEach(monthKey => {
            if (groupedData[monthKey]) {
                const monthData = groupedData[monthKey];
                const monthRevenue = monthData.entries.reduce((sum, entry) => sum + (entry.receivedRate || entry.rate || 0), 0);
                totalRevenue += monthRevenue;
                // Only count entries with category "yoga teaching"
                const yogaTeachingCount = monthData.entries.filter(entry => entry.category === 'yoga teaching').length;
                totalClasses += yogaTeachingCount;
                monthNames.push(monthData.name);
            }
        });

        return {
            totalRevenue,
            totalClasses,
            monthNames,
            hasExpandedMonths: expandedMonths.size > 0
        };
    };

    const toggleMonth = (monthKey) => {
        const newExpanded = new Set(expandedMonths);
        if (newExpanded.has(monthKey)) {
            newExpanded.delete(monthKey);
        } else {
            newExpanded.add(monthKey);
        }
        setExpandedMonths(newExpanded);
    };

    const toggleYear = (yearStr, monthKeysInYear) => {
        const willOpen = !expandedYearsRef.current.has(yearStr);
        setExpandedYears((prev) => {
            const next = new Set(prev);
            if (willOpen) next.add(yearStr);
            else next.delete(yearStr);
            return next;
        });
        if (!willOpen) {
            setExpandedMonths((prev) => {
                const next = new Set(prev);
                monthKeysInYear.forEach((k) => next.delete(k));
                return next;
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateRepeatDates = (startDate, frequency, count) => {
        const dates = [];
        // Parse date string as local date to avoid timezone shifts
        const [year, month, day] = startDate.split('-');
        const start = new Date(year, month - 1, day); // month is 0-indexed
        
        for (let i = 0; i < count; i++) {
            const newDate = new Date(start);
            
            switch (frequency) {
                case 'daily':
                    newDate.setDate(start.getDate() + (i * 1));
                    break;
                case 'weekly':
                    newDate.setDate(start.getDate() + (i * 7));
                    break;
                case 'biweekly':
                    newDate.setDate(start.getDate() + (i * 14));
                    break;
                case 'monthly':
                    newDate.setMonth(start.getMonth() + i);
                    break;
                default:
                    newDate.setDate(start.getDate() + (i * 7)); // Default to weekly
            }
            
            // Format as YYYY-MM-DD using local date
            const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
            dates.push(formattedDate);
        }
        
        return dates;
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('adminToken');
            
            // Prepare entries to create
            const entriesToCreate = [];
            
            if (newEntry.repeat === 'yes') {
                // Generate multiple dates
                const dates = generateRepeatDates(
                    newEntry.date, 
                    newEntry.repeatFrequency, 
                    parseInt(newEntry.repeatCount)
                );
                
                // Create entry for each date
                dates.forEach(date => {
                    const loc = normalizeFinanceLocation(newEntry.location);
                    const trip = computeTripMilesAndGasForRow(loc, milesOverrides, travelSettings);
                    entriesToCreate.push({
                        date,
                        time: newEntry.time,
                        class: newEntry.class,
                        location: loc,
                        category: newEntry.category,
                        grossRate: newEntry.grossRate,
                        receivedRate: newEntry.receivedRate,
                        paymentFrequency: newEntry.paymentFrequency,
                        paymentMethod: newEntry.paymentMethod,
                        paymentRequestSent: newEntry.paymentRequestSent,
                        paid: newEntry.paid,
                        taxed: newEntry.taxed,
                        tripMiles: trip.tripMiles,
                        tripGasCost: trip.tripGasCost,
                    });
                });
            } else {
                const loc = normalizeFinanceLocation(newEntry.location);
                const trip = computeTripMilesAndGasForRow(loc, milesOverrides, travelSettings);
                entriesToCreate.push({
                    date: newEntry.date,
                    time: newEntry.time,
                    class: newEntry.class,
                    location: loc,
                    category: newEntry.category,
                    grossRate: newEntry.grossRate,
                    receivedRate: newEntry.receivedRate,
                    paymentFrequency: newEntry.paymentFrequency,
                    paymentMethod: newEntry.paymentMethod,
                    paymentRequestSent: newEntry.paymentRequestSent,
                    paid: newEntry.paid,
                    taxed: newEntry.taxed,
                    tripMiles: trip.tripMiles,
                    tripGasCost: trip.tripGasCost,
                });
            }

            // Create all entries
            const createdEntries = [];
            for (const entryData of entriesToCreate) {
                const response = await adminAxiosInstance.post('/api/finances', entryData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    createdEntries.push({
                        ...response.data.finance,
                        id: response.data.finance._id
                    });
                } else {
                    throw new Error(response.data.message);
                }
            }

            // Update local state with all new entries
            const updatedData = [...classData, ...createdEntries];
            setClassData(sortClassData(updatedData));
            
            // Reset form
            setNewEntry({
                date: '',
                time: '',
                class: '',
                location: '',
                locationPreset: '',
                category: 'other',
                grossRate: '',
                receivedRate: '',
                paymentFrequency: 'per-class',
                paymentMethod: 'cash',
                paymentRequestSent: 'no',
                paid: 'no',
                taxed: 'no',
                repeat: 'no',
                repeatCount: 1,
                repeatFrequency: 'weekly'
            });
            setShowAddForm(false);

            const entryCount = createdEntries.length;
            Swal.fire({
                title: 'Success!',
                text: `${entryCount} finance ${entryCount === 1 ? 'entry' : 'entries'} added successfully`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

        } catch (error) {
            console.error('Error adding finance entry:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to add finance entry',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const formatCurrency = (amount) => {
        const n = Number(amount);
        if (amount == null || Number.isNaN(n)) return '—';
        return `$${n.toFixed(2)}`;
    };

    const formatTripMiles = (v) => {
        if (v == null) return '—';
        return `${Math.round(Number(v)).toLocaleString()} mi`;
    };

    const formatDate = (dateString) => {
        // Parse date string as local date to avoid timezone shifts
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setEditingData({ 
            ...entry,
            category: entry.category || 'other',
            grossRate: entry.grossRate || entry.rate || '',
            receivedRate: entry.receivedRate || entry.rate || '',
            location: normalizeFinanceLocation(entry.location),
        });
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const loc = normalizeFinanceLocation(editingData.location);
            const trip = computeTripMilesAndGasForRow(loc, milesOverrides, travelSettings);
            const payload = {
                ...editingData,
                location: loc,
                tripMiles: trip.tripMiles,
                tripGasCost: trip.tripGasCost,
            };
            const response = await adminAxiosInstance.put(`/api/finances/${editingId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                // Update the local state
                const updatedData = classData.map(item => 
                    item.id === editingId ? { ...response.data.finance, id: response.data.finance._id } : item
                );
                setClassData(sortClassData(updatedData));
                setEditingId(null);
                setEditingData({});
                // No popup - just exit edit mode silently
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating finance entry:', error);
            // Only show error popup if something goes wrong
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update finance entry',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    // Handle checkbox selection
    const handleSelectEntry = (entryId) => {
        const newSelected = new Set(selectedEntries);
        if (newSelected.has(entryId)) {
            newSelected.delete(entryId);
        } else {
            newSelected.add(entryId);
        }
        setSelectedEntries(newSelected);
    };

    // Handle select all in a month
    const handleSelectAll = (monthEntries) => {
        const allSelected = monthEntries.every(entry => selectedEntries.has(entry.id));
        const newSelected = new Set(selectedEntries);
        
        if (allSelected) {
            // Deselect all in this month
            monthEntries.forEach(entry => newSelected.delete(entry.id));
        } else {
            // Select all in this month
            monthEntries.forEach(entry => newSelected.add(entry.id));
        }
        setSelectedEntries(newSelected);
    };

    // Handle bulk edit
    const handleBulkEdit = async () => {
        if (selectedEntries.size === 0) {
            Swal.fire({
                title: 'No Entries Selected',
                text: 'Please select at least one entry to edit.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const updates = {};
            
            // Only include fields that have values
            if (bulkEditData.category) updates.category = bulkEditData.category;
            if (bulkEditData.paid) updates.paid = bulkEditData.paid;
            if (bulkEditData.taxed) updates.taxed = bulkEditData.taxed;
            if (bulkEditData.paymentMethod) updates.paymentMethod = bulkEditData.paymentMethod;

            if (Object.keys(updates).length === 0) {
                Swal.fire({
                    title: 'No Changes',
                    text: 'Please select at least one field to update.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // Update each selected entry
            const updatePromises = Array.from(selectedEntries).map(async (entryId) => {
                const entry = classData.find(e => e.id === entryId);
                if (!entry) return;

                // Construct the update payload with all required fields
                // Use existing entry values and override with bulk updates
                const loc = normalizeFinanceLocation(entry.location);
                const trip = computeTripMilesAndGasForRow(loc, milesOverrides, travelSettings);
                const updatedEntry = {
                    date: entry.date,
                    time: entry.time,
                    class: entry.class || entry.className, // Handle both field names
                    location: loc,
                    category: updates.category || entry.category || 'other',
                    grossRate: entry.grossRate || entry.rate || 0,
                    receivedRate: entry.receivedRate || entry.rate || 0,
                    paymentFrequency: entry.paymentFrequency || 'per-class',
                    paymentMethod: updates.paymentMethod || entry.paymentMethod || 'cash',
                    paymentRequestSent: entry.paymentRequestSent || 'no',
                    paid: updates.paid || entry.paid || 'no',
                    taxed: updates.taxed || entry.taxed || 'no',
                    tripMiles: trip.tripMiles,
                    tripGasCost: trip.tripGasCost,
                };

                const response = await adminAxiosInstance.put(`/api/finances/${entryId}`, updatedEntry, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return response.data.finance;
            });

            await Promise.all(updatePromises);
            
            // Refresh data
            await fetchClassData();
            setSelectedEntries(new Set());
            setShowBulkEdit(false);
            setBulkEditData({
                category: '',
                paid: '',
                taxed: '',
                paymentMethod: ''
            });

        } catch (error) {
            console.error('Error bulk updating entries:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update entries',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await adminAxiosInstance.delete(`/api/finances/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    // Remove from local state
                    const updatedData = classData.filter(item => item.id !== id);
                    setClassData(updatedData);

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Finance entry has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('Error deleting finance entry:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete finance entry',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const locationReport = useMemo(() => {
        if (!locationStatsCanonical) return null;
        return buildLocationFinanceReport(classData, locationStatsCanonical, {
            milesOverrides,
            mpg: travelSettings.mpg,
            gasPricePerGallon: travelSettings.gasPricePerGallon,
        });
    }, [locationStatsCanonical, classData, milesOverrides, travelSettings]);

    const closeLocationStats = () => setLocationStatsCanonical(null);

    const toastTravelSaved = (title) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title,
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
        });
    };

    const handleSaveLocationMiles = async () => {
        if (!locationStatsCanonical || isOnlineCanonicalLocation(locationStatsCanonical)) return;
        const raw = statsMilesDraft.trim();
        let nextMiles = { ...milesOverrides };
        if (raw === '') {
            delete nextMiles[locationStatsCanonical];
        } else {
            const n = parseFloat(raw);
            if (Number.isNaN(n) || n < 0) {
                Swal.fire({
                    title: 'Invalid miles',
                    text: 'Enter a non-negative number, or leave blank to clear saved miles.',
                    icon: 'warning',
                });
                return;
            }
            nextMiles = { ...nextMiles, [locationStatsCanonical]: n };
        }
        try {
            await persistFinanceTravelSettings(nextMiles, travelSettings);
            toastTravelSaved('Added miles for this location');
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Not saved',
                text: error.response?.data?.message || error.message || 'Could not save to server',
                icon: 'error',
            });
        }
    };

    const handleSaveTravelSettingsFromModal = async () => {
        const mpgParsed = parseFloat(statsMpgDraft);
        const gasParsed = parseFloat(statsGasDraft);
        if (Number.isNaN(mpgParsed) || mpgParsed <= 0) {
            Swal.fire({
                title: 'Invalid MPG',
                text: `Use a positive number. Hyundai Tucson Hybrid EPA combined is 38 (FWD) or 37 (AWD); default here is ${DEFAULT_TUCSON_HYBRID_MPG}.`,
                icon: 'warning',
            });
            return;
        }
        if (Number.isNaN(gasParsed) || gasParsed < 0) {
            Swal.fire({
                title: 'Invalid gas price',
                text: 'Enter price per gallon in dollars.',
                icon: 'warning',
            });
            return;
        }
        try {
            await persistFinanceTravelSettings(milesOverrides, {
                mpg: mpgParsed,
                gasPricePerGallon: gasParsed,
            });
            setStatsMpgDraft(String(mpgParsed));
            setStatsGasDraft(String(gasParsed));
            toastTravelSaved('Added vehicle');
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Not saved',
                text: error.response?.data?.message || error.message || 'Could not save to server',
                icon: 'error',
            });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-finances">
                    <div className="loading">Loading class data...</div>
                </div>
            </AdminLayout>
        );
    }

    const {
        summaryYear: driveStatsYear,
        totalMiles: totalDriveMilesForYear,
        totalGas: totalGasDriveForYear,
        byLocationSorted: driveByLocationForYear,
    } = currentYearDriveAggregates;

    const totalRevenue = classData.reduce((sum, entry) => sum + (entry.receivedRate || entry.rate || 0), 0);
    const totalRevenue2025 = classData.reduce((sum, entry) => {
        const year = Number((entry.date || '').split('-')[0]);
        return year === 2025 ? sum + (entry.receivedRate || entry.rate || 0) : sum;
    }, 0);
    const totalRevenue2026 = classData.reduce((sum, entry) => {
        const year = Number((entry.date || '').split('-')[0]);
        return year === 2026 ? sum + (entry.receivedRate || entry.rate || 0) : sum;
    }, 0);

    const monthlyTotals = calculateMonthlyTotals(groupedData, expandedMonths);

    return (
        <AdminLayout>
            <div className="admin-finances">
            <h3 className="section-title">Class & Financial Tracking</h3>
            <div className="finances-header">
                <div className="header-actions">
                    {selectedEntries.size > 0 && (
                        <button 
                            className="bulk-edit-btn"
                            onClick={() => setShowBulkEdit(true)}
                        >
                            Bulk Edit ({selectedEntries.size})
                        </button>
                    )}
                    <button 
                        className="add-entry-btn"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Cancel' : 'Add New'}
                    </button>
                </div>
            </div>

            <div className="finances-summary">
                <div className="finances-summary__row finances-summary__row--top">
                    <div className="summary-card yearly">
                        <h3>Total Revenue (All Time)</h3>
                        <p className="revenue-amount">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="summary-card yearly">
                        <h3>Total Revenue (2025)</h3>
                        <p className="revenue-amount">{formatCurrency(totalRevenue2025)}</p>
                    </div>
                    <div className="summary-card yearly">
                        <h3>Total Revenue (2026)</h3>
                        <p className="revenue-amount">{formatCurrency(totalRevenue2026)}</p>
                    </div>
                    <div className="summary-card monthly">
                        <h3>
                            {monthlyTotals.hasExpandedMonths
                                ? (monthlyTotals.monthNames.length === 1
                                    ? `${monthlyTotals.monthNames[0]} Revenue`
                                    : `Selected Months Revenue`)
                                : 'Selected Month Revenue'}
                        </h3>
                        <p className="revenue-amount">
                            {monthlyTotals.hasExpandedMonths ? formatCurrency(monthlyTotals.totalRevenue) : '—'}
                        </p>
                        {monthlyTotals.hasExpandedMonths && monthlyTotals.monthNames.length > 1 && (
                            <p className="month-list">{monthlyTotals.monthNames.join(', ')}</p>
                        )}
                    </div>
                </div>

                <div className="finances-summary__row finances-summary__row--bottom">
                    <div className="summary-card yearly">
                        <h3>Total Classes (All Time)</h3>
                        <p className="revenue-amount">{classData.filter(entry => entry.category === 'yoga teaching').length}</p>
                    </div>
                    <div className="summary-card monthly">
                        <h3>
                            {monthlyTotals.hasExpandedMonths
                                ? (monthlyTotals.monthNames.length === 1
                                    ? `${monthlyTotals.monthNames[0]} Classes`
                                    : `Selected Months Classes`)
                                : 'Selected Month Classes'}
                        </h3>
                        <p className="revenue-amount">{monthlyTotals.hasExpandedMonths ? monthlyTotals.totalClasses : '—'}</p>
                        {monthlyTotals.hasExpandedMonths && monthlyTotals.monthNames.length > 1 && (
                            <p className="month-list">{monthlyTotals.monthNames.join(', ')}</p>
                        )}
                    </div>
                    <div
                        className="summary-card yearly"
                        title={`Total round-trip drive miles for all entries dated in ${driveStatsYear} (current calendar year). Same trip math as the table below.`}
                    >
                        <h3>Drive Miles (RT) ({driveStatsYear})</h3>
                        <p className="revenue-amount">{formatTripMiles(totalDriveMilesForYear)}</p>
                    </div>
                    <div
                        className="summary-card yearly"
                        title={`Estimated gas for those round trips in ${driveStatsYear} (current calendar year). Uses MPG and $/gal from travel settings.`}
                    >
                        <h3>Gas — Driving ({driveStatsYear})</h3>
                        <p className="revenue-amount">{formatCurrency(totalGasDriveForYear)}</p>
                    </div>
                </div>
            </div>

            <section
                className="finances-drive-by-location"
                aria-label={`Drive miles by location for ${driveStatsYear}`}
            >
                <div
                    className={`finances-drive-by-location__toggle ${
                        driveByLocationOpen ? 'finances-drive-by-location__toggle--open' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={driveByLocationOpen}
                    title={driveByLocationOpen ? 'Click to hide details' : 'Click to show breakdown by location'}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setDriveByLocationOpen((open) => !open);
                        }
                    }}
                    onClick={() => setDriveByLocationOpen((open) => !open)}
                >
                    <span className="finances-drive-by-location__expand-icon" aria-hidden="true">
                        {driveByLocationOpen ? '▼' : '▶'}
                    </span>
                    <span className="finances-drive-by-location__toggle-label">
                        Miles driven by location ({driveStatsYear})
                    </span>
                </div>
                {driveByLocationOpen && (
                    <>
                        <p className="finances-drive-by-location__hint">
                            Current calendar year: round-trip miles and estimated gas per normalized location for all
                            finance rows dated in {driveStatsYear}. Same trip math as the table below.
                        </p>
                        {driveByLocationForYear.length === 0 ? (
                            <p className="finances-drive-by-location__empty">
                                No finance entries dated in {driveStatsYear}.
                            </p>
                        ) : (
                            <div className="finances-drive-by-location__wrap">
                                <table className="finances-drive-by-location__table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Location</th>
                                            <th scope="col">Drive miles (RT)</th>
                                            <th scope="col">Est. gas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {driveByLocationForYear.map(([loc, agg]) => (
                                            <tr key={loc}>
                                                <td>{loc}</td>
                                                <td>{formatTripMiles(agg.miles)}</td>
                                                <td>{formatCurrency(agg.gas)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th scope="row">Total</th>
                                            <td>{formatTripMiles(totalDriveMilesForYear)}</td>
                                            <td>{formatCurrency(totalGasDriveForYear)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </section>

            {showAddForm && (
                <div className="add-entry-form">
                    <h2>Add New Entry</h2>
                    <form onSubmit={handleAddEntry}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={newEntry.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={newEntry.time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Class</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={newEntry.class}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Hatha Yoga"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <select
                                    value={newEntry.locationPreset}
                                    onChange={(e) => handleLocationPresetChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select a location</option>
                                    {LOCATION_PRESETS.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                                {newEntry.locationPreset === 'other' && (
                                    <input
                                        type="text"
                                        name="location"
                                        value={newEntry.location}
                                        onChange={handleInputChange}
                                        placeholder="Enter a location name"
                                        required
                                        className="location-other-input"
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={newEntry.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="chocolate">Chocolate</option>
                                    <option value="yoga teaching">Yoga Teaching</option>
                                    <option value="yoga therapy">Yoga Therapy</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gross Rate ($)</label>
                                <input
                                    type="number"
                                    name="grossRate"
                                    value={newEntry.grossRate}
                                    onChange={handleInputChange}
                                    placeholder="100.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Received ($)</label>
                                <input
                                    type="number"
                                    name="receivedRate"
                                    value={newEntry.receivedRate}
                                    onChange={handleInputChange}
                                    placeholder="75.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Frequency</label>
                                <select
                                    name="paymentFrequency"
                                    value={newEntry.paymentFrequency}
                                    onChange={handleInputChange}
                                >
                                    <option value="per-class">Per Class</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="biweekly">Biweekly</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={newEntry.paymentMethod}
                                    onChange={handleInputChange}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="venmo">Venmo</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="zelle">Zelle</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Request Sent</label>
                                <select
                                    name="paymentRequestSent"
                                    value={newEntry.paymentRequestSent}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                    <option value="n/a">N/A</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Paid</label>
                                <select
                                    name="paid"
                                    value={newEntry.paid}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Taxed</label>
                                <select
                                    name="taxed"
                                    value={newEntry.taxed}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row repeat-section">
                            <div className="form-group">
                                <label>Repeat Class</label>
                                <select
                                    name="repeat"
                                    value={newEntry.repeat}
                                    onChange={handleInputChange}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            {newEntry.repeat === 'yes' && (
                                <>
                                    <div className="form-group">
                                        <label>How Many Times</label>
                                        <input
                                            type="number"
                                            name="repeatCount"
                                            value={newEntry.repeatCount}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="52"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Repeat Every</label>
                                        <select
                                            name="repeatFrequency"
                                            value={newEntry.repeatFrequency}
                                            onChange={handleInputChange}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Biweekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Add Entry</button>
                            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="class-table-container">
                <div className="class-table">
                    <div className="table-header">
                        <div className="header-cell checkbox-cell">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    const allEntries = Object.values(groupedData).flatMap(m => m.entries);
                                    if (e.target.checked) {
                                        setSelectedEntries(new Set(allEntries.map(e => e.id)));
                                    } else {
                                        setSelectedEntries(new Set());
                                    }
                                }}
                                checked={selectedEntries.size > 0 && Object.values(groupedData).flatMap(m => m.entries).every(e => selectedEntries.has(e.id))}
                                ref={(input) => {
                                    if (input) {
                                        const allEntries = Object.values(groupedData).flatMap(m => m.entries);
                                        input.indeterminate = selectedEntries.size > 0 && selectedEntries.size < allEntries.length;
                                    }
                                }}
                            />
                        </div>
                        <div className="header-cell">Category</div>
                        <div className="header-cell">Date</div>
                        <div className="header-cell">Time</div>
                        <div className="header-cell">Class</div>
                        <div className="header-cell header-cell--hint" title="Click a location in a row for yearly totals, pay per class, and drive estimates">
                            Location
                        </div>
                        <div className="header-cell" title="Gross rate">
                            Gross
                        </div>
                        <div className="header-cell" title="Received rate">
                            Received
                        </div>
                        <div
                            className="header-cell"
                            title="Drive miles for the round trip (there and back). One-way distance is set per location in Location stats."
                        >
                            Drive (RT)
                        </div>
                        <div className="header-cell" title="Est. gas for this trip (MPG & $/gal in Location stats)">
                            Gas
                        </div>
                        <div className="header-cell" title="Payment method">
                            Pay
                        </div>
                        <div className="header-cell">Paid</div>
                        <div className="header-cell">Taxed</div>
                        <div className="header-cell">Actions</div>
                    </div>

                    {sortedYears.map((yearStr) => {
                        const monthTuples = monthsByYear.get(yearStr) || [];
                        const yearOpen = expandedYears.has(yearStr);
                        const monthKeysInYear = monthTuples.map(([k]) => k);
                        const yearTeaching = monthTuples.reduce((s, [, m]) => s + m.yogaTeachingCount, 0);
                        const yearTherapy = monthTuples.reduce((s, [, m]) => s + m.yogaTherapyCount, 0);
                        return (
                            <div
                                key={yearStr}
                                className={`finances-year-block ${yearOpen ? 'finances-year-block--open' : ''}`}
                            >
                                <div
                                    className={`year-header ${yearOpen ? 'expanded' : ''}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={yearOpen}
                                    title={
                                        yearOpen
                                            ? 'Click to hide months for this year'
                                            : 'Click to list months for this year (expand a month to see classes)'
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleYear(yearStr, monthKeysInYear);
                                        }
                                    }}
                                    onClick={(e) => {
                                        if (e.target.type !== 'checkbox') {
                                            toggleYear(yearStr, monthKeysInYear);
                                        }
                                    }}
                                >
                                    <span className="year-header__checkbox-spacer" aria-hidden="true" />
                                    <span className="month-label">
                                        <span className="expand-icon" aria-hidden="true">
                                            {yearOpen ? '▼' : '▶'}
                                        </span>
                                        <span className="month-name">{yearStr}</span>
                                    </span>
                                    <div className="month-count">
                                        <span className="month-count__teach">{yearTeaching} classes</span>
                                        <span className="month-count__sep" aria-hidden="true">
                                            {' · '}
                                        </span>
                                        <span className="month-count__therapy">
                                            {yearTherapy}
                                            {'\u00a0'}
                                            therapy
                                        </span>
                                    </div>
                                </div>
                                {yearOpen &&
                                    monthTuples.map(([monthKey, monthData]) => (
                                        <div key={monthKey} className="month-group">
                            <div 
                                className={`month-header ${expandedMonths.has(monthKey) ? 'expanded' : ''}`}
                                onClick={(e) => {
                                    // Don't toggle if clicking on checkbox
                                    if (e.target.type !== 'checkbox') {
                                        toggleMonth(monthKey);
                                    }
                                }}
                            >
                                <input
                                    type="checkbox"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => handleSelectAll(monthData.entries)}
                                    checked={monthData.entries.length > 0 && monthData.entries.every(entry => selectedEntries.has(entry.id))}
                                    ref={(input) => {
                                        if (input) {
                                            input.indeterminate = monthData.entries.some(entry => selectedEntries.has(entry.id)) && 
                                                                 !monthData.entries.every(entry => selectedEntries.has(entry.id));
                                        }
                                    }}
                                />
                                <span className="month-label">
                                    <span className="expand-icon" aria-hidden="true">
                                        {expandedMonths.has(monthKey) ? '▼' : '▶'}
                                    </span>
                                    <span className="month-name">{monthData.name}</span>
                                </span>
                                <div className="month-count">
                                    <span className="month-count__teach">{monthData.yogaTeachingCount} classes</span>
                                    <span className="month-count__sep" aria-hidden="true">
                                        {' · '}
                                    </span>
                                    <span className="month-count__therapy">
                                        {monthData.yogaTherapyCount}
                                        {'\u00a0'}
                                        therapy
                                    </span>
                                </div>
                            </div>
                            
                            {expandedMonths.has(monthKey) && (
                                <div className="month-entries">
                                    {monthData.entries.map((entry) => {
                                        const editingThis = editingId === entry.id;
                                        const tripForRow = computeTripMilesAndGasForRow(
                                            normalizeFinanceLocation(
                                                editingThis ? (editingData.location || '') : entry.location
                                            ),
                                            milesOverrides,
                                            travelSettings
                                        );
                                        return (
                                        <div key={entry.id} className={`table-row ${selectedEntries.has(entry.id) ? 'selected' : ''}`}>
                                            <div className="table-cell checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEntries.has(entry.id)}
                                                    onChange={() => handleSelectEntry(entry.id)}
                                                />
                                            </div>
                                            {editingId === entry.id ? (
                                                // Edit mode
                                                <>
                                                    <div className="table-cell">
                                                        <select
                                                            name="category"
                                                            value={editingData.category || 'other'}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select category-select"
                                                        >
                                                            <option value="chocolate">Chocolate</option>
                                                            <option value="yoga teaching">Yoga Teaching</option>
                                                            <option value="yoga therapy">Yoga Therapy</option>
                                                            <option value="workshop">Workshop</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            value={editingData.date}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell">
                                                        <input
                                                            type="time"
                                                            name="time"
                                                            value={editingData.time}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell table-cell--class-col">
                                                        <input
                                                            type="text"
                                                            name="class"
                                                            value={editingData.class}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                    </div>
                                                    <div className="table-cell table-cell--location-edit">
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={editingData.location}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="location-stats-inline-btn"
                                                            title="Open stats for this location"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocationStatsCanonical(
                                                                    normalizeFinanceLocation(editingData.location)
                                                                );
                                                            }}
                                                        >
                                                            ⓘ
                                                        </button>
                                                    </div>
                                                    <div className="table-cell table-cell--rate">
                                                        <input
                                                            type="number"
                                                            name="grossRate"
                                                            value={editingData.grossRate}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="table-cell table-cell--rate">
                                                        <input
                                                            type="number"
                                                            name="receivedRate"
                                                            value={editingData.receivedRate}
                                                            onChange={handleEditInputChange}
                                                            className="edit-input"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--trip-preview"
                                                        title="Round-trip drive miles; saved on ✓ from current location & travel settings"
                                                    >
                                                        {formatTripMiles(tripForRow.tripMiles)}
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--trip-preview"
                                                        title="Est. gas for this round trip; saved on ✓ from travel settings"
                                                    >
                                                        {formatCurrency(tripForRow.tripGasCost)}
                                                    </div>
                                                    <div className="table-cell table-cell--payment-col">
                                                        <select
                                                            name="paymentMethod"
                                                            value={editingData.paymentMethod}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="cash">Cash</option>
                                                            <option value="check">Check</option>
                                                            <option value="venmo">Venmo</option>
                                                            <option value="paypal">PayPal</option>
                                                            <option value="zelle">Zelle</option>
                                                            <option value="deposit">Deposit</option>
                                                            <option value="card">Card</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <select
                                                            name="paid"
                                                            value={editingData.paid}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="no">No</option>
                                                            <option value="yes">Yes</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell">
                                                        <select
                                                            name="taxed"
                                                            value={editingData.taxed}
                                                            onChange={handleEditInputChange}
                                                            className="edit-select"
                                                        >
                                                            <option value="no">No</option>
                                                            <option value="yes">Yes</option>
                                                        </select>
                                                    </div>
                                                    <div className="table-cell actions-cell">
                                                        <button className="save-btn" onClick={handleSaveEdit}>✓</button>
                                                        <button className="cancel-btn" onClick={handleCancelEdit}>✕</button>
                                                    </div>
                                                </>
                                            ) : (
                                                // View mode
                                                <>
                                                    <div
                                                        className={`table-cell category-cell table-cell--truncate category-${(entry.category || 'other').replace(/\s+/g, '-')}`}
                                                        title={entry.category || 'other'}
                                                    >
                                                        {entry.category || 'other'}
                                                    </div>
                                                    <div className="table-cell">{formatDate(entry.date)}</div>
                                                    <div className="table-cell">{formatTime(entry.time)}</div>
                                                    <div
                                                        className="table-cell table-cell--class-col table-cell--truncate"
                                                        title={entry.class || ''}
                                                    >
                                                        {entry.class}
                                                    </div>
                                                    <div className="table-cell table-cell--location-wrap">
                                                        <button
                                                            type="button"
                                                            className="location-cell--clickable"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocationStatsCanonical(
                                                                    normalizeFinanceLocation(entry.location)
                                                                );
                                                            }}
                                                            title={`${normalizeFinanceLocation(entry.location)} — tax & mileage stats`}
                                                        >
                                                            {normalizeFinanceLocation(entry.location)}
                                                        </button>
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--rate"
                                                        title={formatCurrency(entry.grossRate || entry.rate || 0)}
                                                    >
                                                        {formatCurrency(entry.grossRate || entry.rate || 0)}
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--rate"
                                                        title={formatCurrency(entry.receivedRate || entry.rate || 0)}
                                                    >
                                                        {formatCurrency(entry.receivedRate || entry.rate || 0)}
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--trip-preview"
                                                        title="Round-trip drive miles from travel settings & location (stored on row when you save)"
                                                    >
                                                        {formatTripMiles(tripForRow.tripMiles)}
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--trip-preview"
                                                        title="Est. gas for this round trip from travel settings (stored on row when you save)"
                                                    >
                                                        {formatCurrency(tripForRow.tripGasCost)}
                                                    </div>
                                                    <div
                                                        className="table-cell table-cell--payment-col table-cell--truncate"
                                                        title={entry.paymentMethod || ''}
                                                    >
                                                        {entry.paymentMethod}
                                                    </div>
                                                    <div className={`table-cell status-${entry.paid}`}>
                                                        {entry.paid}
                                                    </div>
                                                    <div className={`table-cell status-${entry.taxed}`}>
                                                        {entry.taxed}
                                                    </div>
                                                    <div className="table-cell actions-cell">
                                                        <button className="edit-btn" onClick={() => handleEdit(entry)}>✏️</button>
                                                        <button className="delete-btn" onClick={() => handleDelete(entry.id)}>🗑️</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                                        </div>
                                    ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {locationStatsCanonical && locationReport && (
                <div className="location-stats-modal" onClick={closeLocationStats} role="presentation">
                    <div
                        className="location-stats-content"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-labelledby="location-stats-title"
                    >
                        <div className="location-stats-header">
                            <h3 id="location-stats-title">{locationReport.canonicalLocation}</h3>
                            <button type="button" className="location-stats-close" onClick={closeLocationStats} aria-label="Close">
                                ✕
                            </button>
                        </div>
                        <p className="location-stats-meta">
                            {locationReport.entryCount} finance {locationReport.entryCount === 1 ? 'row' : 'rows'} at this location (all categories).
                        </p>

                        <div className="location-stats-section">
                            <h4>By year (tax & teaching)</h4>
                            <div className="location-stats-table-wrap">
                                <table className="location-stats-table">
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            <th>Yoga classes</th>
                                            <th>Gross</th>
                                            <th>Received</th>
                                            <th>Drive miles (RT)</th>
                                            <th>Gas spent (est.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locationReport.years.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="location-stats-empty">
                                                    No rows for this location yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            locationReport.years.map((y) => (
                                                <tr key={y.year}>
                                                    <td>{y.year}</td>
                                                    <td>{y.teachingCount}</td>
                                                    <td>{formatCurrency(y.grossTotal)}</td>
                                                    <td>{formatCurrency(y.receivedTotal)}</td>
                                                    <td>
                                                        {y.roundTripMilesTotal == null
                                                            ? '—'
                                                            : `${Math.round(y.roundTripMilesTotal).toLocaleString()} mi`}
                                                    </td>
                                                    <td>
                                                        {y.gasCost == null ? '—' : formatCurrency(y.gasCost)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {locationReport.years.length > 0 && (
                                        <tfoot>
                                            <tr>
                                                <td>All years</td>
                                                <td>{locationReport.allTime.teachingCount}</td>
                                                <td>{formatCurrency(locationReport.allTime.grossTotal)}</td>
                                                <td>{formatCurrency(locationReport.allTime.receivedTotal)}</td>
                                                <td>
                                                    {locationReport.allTime.roundTripMilesTotal == null
                                                        ? '—'
                                                        : `${Math.round(
                                                              locationReport.allTime.roundTripMilesTotal
                                                          ).toLocaleString()} mi`}
                                                </td>
                                                <td>
                                                    {locationReport.allTime.gasCost == null
                                                        ? '—'
                                                        : formatCurrency(locationReport.allTime.gasCost)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        <div className="location-stats-section">
                            <h4>Gross pay per yoga class (this location)</h4>
                            <ul className="location-stats-gross-list">
                                <li>
                                    <span>Average gross / class</span>
                                    <strong>
                                        {locationReport.allTime.avgGrossPerTeachingClass == null
                                            ? '—'
                                            : formatCurrency(locationReport.allTime.avgGrossPerTeachingClass)}
                                    </strong>
                                </li>
                                <li>
                                    <span>Low / high gross (yoga teaching)</span>
                                    <strong>
                                        {locationReport.allTime.minGrossTeaching == null
                                            ? '—'
                                            : `${formatCurrency(locationReport.allTime.minGrossTeaching)} – ${formatCurrency(
                                                  locationReport.allTime.maxGrossTeaching
                                              )}`}
                                    </strong>
                                </li>
                            </ul>
                        </div>

                        <div className="location-stats-section location-stats-section--travel">
                            <h4>Driving &amp; gas (Hyundai Tucson Hybrid)</h4>
                            <p className="location-stats-tucson-note">
                                EPA combined mpg: <strong>38</strong> (FWD) / <strong>37</strong> (AWD). Default below is{' '}
                                <strong>{DEFAULT_TUCSON_HYBRID_MPG}</strong> (midpoint). Change if your trim matches one side or
                                your real-world mileage differs.
                            </p>
                            {!isOnlineCanonicalLocation(locationStatsCanonical) ? (
                                <>
                                    <div className="location-stats-travel-grid">
                                        <label className="location-stats-field">
                                            <span>One-way miles (home → studio)</span>
                                            <div className="location-stats-field-row location-stats-field-row--save">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={statsMilesDraft}
                                                    onChange={(e) => setStatsMilesDraft(e.target.value)}
                                                    placeholder="e.g. 8.2"
                                                />
                                                <button
                                                    type="button"
                                                    className="submit-btn location-stats-save-btn"
                                                    onClick={handleSaveLocationMiles}
                                                >
                                                    Add miles for this location
                                                </button>
                                            </div>
                                            <span className="location-stats-hint">
                                                Stored in your database (same on any device you use to log in). Each finance row
                                                counts as one round trip (
                                                {locationReport.roundTripMilesPerSession == null
                                                    ? 'set miles to calculate'
                                                    : `${Math.round(locationReport.roundTripMilesPerSession)} mi RT`}
                                                ). Same-day multi-class trips may slightly over-count.
                                            </span>
                                        </label>
                                        <label className="location-stats-field">
                                            <span>
                                                MPG &amp; gas price ($/gal) — default mpg {DEFAULT_TUCSON_HYBRID_MPG}, gas{' '}
                                                {DEFAULT_GAS_PRICE_PER_GALLON.toFixed(2)}
                                            </span>
                                            <div className="location-stats-field-row location-stats-field-row--split location-stats-field-row--save">
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={statsMpgDraft}
                                                    onChange={(e) => setStatsMpgDraft(e.target.value)}
                                                    aria-label="Miles per gallon"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={statsGasDraft}
                                                    onChange={(e) => setStatsGasDraft(e.target.value)}
                                                    aria-label="Dollars per gallon"
                                                />
                                                <button
                                                    type="button"
                                                    className="submit-btn location-stats-save-btn"
                                                    onClick={handleSaveTravelSettingsFromModal}
                                                >
                                                    Add vehicle
                                                </button>
                                            </div>
                                            <span className="location-stats-hint">Stored in your database for all locations.</span>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <p className="location-stats-hint">No drive miles for Online.</p>
                            )}
                        </div>

                        <div className="location-stats-actions">
                            <button type="button" className="cancel-btn" onClick={closeLocationStats}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Edit Modal */}
            {showBulkEdit && (
                <div className="bulk-edit-modal">
                    <div className="bulk-edit-content">
                        <h3>Bulk Edit ({selectedEntries.size} entries)</h3>
                        <p className="bulk-edit-note">Leave fields empty to keep current values. Only filled fields will be updated.</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleBulkEdit(); }}>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={bulkEditData.category}
                                    onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="chocolate">Chocolate</option>
                                    <option value="yoga teaching">Yoga Teaching</option>
                                    <option value="yoga therapy">Yoga Therapy</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Paid</label>
                                <select
                                    name="paid"
                                    value={bulkEditData.paid}
                                    onChange={(e) => setBulkEditData({ ...bulkEditData, paid: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Taxed</label>
                                <select
                                    name="taxed"
                                    value={bulkEditData.taxed}
                                    onChange={(e) => setBulkEditData({ ...bulkEditData, taxed: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={bulkEditData.paymentMethod}
                                    onChange={(e) => setBulkEditData({ ...bulkEditData, paymentMethod: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="venmo">Venmo</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="zelle">Zelle</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">Apply Changes</button>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => {
                                        setShowBulkEdit(false);
                                        setBulkEditData({
                                            category: '',
                                            paid: '',
                                            taxed: '',
                                            paymentMethod: ''
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
};

export default AdminFinances;
