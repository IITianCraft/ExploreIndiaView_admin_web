import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit as firestoreLimit,
    getCountFromServer,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import api from './api';

export interface AdminDashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalForumPosts: number;
    totalScratchCards: number;
    recentBookings: any[];
    recentUsers: any[];
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    status: string;
    createdAt: string;
    _data?: any; // Store raw data for details view
}

export interface AdminPartner {
    id: string;
    businessName: string;
    contactPerson: string;
    email: string;
    phone: string;
    types: string[];
    city: string;
    state: string;
    commission: number;
    status: 'Active' | 'Inactive';
    verificationStatus: 'pending' | 'verified' | 'rejected';
    createdAt: string;
}

export interface AdminAffiliate {
    id: string;
    name: string;
    code: string;
    referrals: number;
    earnings: number;
    status: string;
    clicks: number;
    conversions: number;
    convRate: string;
    website?: string;
}

export interface AdminHotel {
    id: string;
    name: string;
    location: string;
    rooms: number;
    pricePerNight: number;
    status: string;
}

export interface AdminVehicle {
    id: string;
    name: string;
    type: 'flight' | 'train' | 'cab';
    provider: string;
    price: number;
    status: string;
}

export interface AdminPackage {
    id: string;
    name: string;
    duration: string;
    price: number;
    location: string;
    status: string;
}

export interface WalletStats {
    balance: number;
    totalEarnings: number;
    pendingPayouts: number;
    totalWithdrawals: number;
}

export interface Transaction {
    id: string;
    type: 'earning' | 'withdrawal' | 'refund';
    amount: number;
    status: string;
    date: string;
    description: string;
}

export interface AdminBooking {
    id: string;
    PackageName: string;
    PackageDays: number;
    PackagePrice: number;
    startDate: string;
    people: number;
    user: {
        mobile: string;
        name?: string;
        email?: string;
    };
    userId?: string; // Added for navigation
    paymentStatus: string;
    status?: string;
    _data?: any; // Store raw data for details view
    createdAt?: string;
}


export interface ServiceBooking {
    id: string;
    customerName: string;
    customerEmail: string;
    details: string; // e.g. "AI-102 (DEL-BOM)", "12034 (NDLS-HWH)"
    date: string;
    amount: number;
    commission: number;
    status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Failed';
    _data?: any;
    userId?: string;
}

// Mock data relocated to live fetching logic in AdminService class

class AdminService {
    // ... existing methods

    async getServiceBookings(type: 'flights' | 'trains' | 'hotels' | 'cabs'): Promise<ServiceBooking[]> {
        try {
            const serviceTypeMap = {
                flights: 'flight',
                trains: 'train',
                hotels: 'hotel',
                cabs: 'cab'
            };
            const firestoreType = serviceTypeMap[type];

            console.log(`Fetching real ${type} bookings from Firestore...`);
            const querySnapshot = await getDocs(collection(db, 'bookings'));

            const bookings: any[] = [];
            const userIds = new Set<string>();

            querySnapshot.forEach(doc => {
                const data = doc.data() as any;
                // Match by type (some might be stored with different casing)
                if (data.type?.toLowerCase() === firestoreType) {
                    if (data.userId) userIds.add(data.userId);
                    bookings.push({ id: doc.id, _data: data });
                }
            });

            // Fetch user details
            const userMap = new Map<string, any>();
            await Promise.all(Array.from(userIds).map(async (uid) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        userMap.set(uid, userDoc.data());
                    }
                } catch (e) {
                    console.warn(`Failed to fetch user ${uid} `, e);
                }
            }));

            return bookings.map((b: any) => {
                const data = b._data;
                const userData = userMap.get(data.userId) || {};
                const amount = data.totalAmount || data.price || data.PackagePrice || data.total_amount || 0;

                let details = '';
                if (firestoreType === 'flight') {
                    details = data.flightNumber ? `${data.flightNumber} (${data.from || ''} -${data.to || ''})` : (data.packageName || 'Flight Booking');
                } else if (firestoreType === 'train') {
                    details = data.trainNumber ? `${data.trainNumber} (${data.from || ''} -${data.to || ''})` : (data.packageName || 'Train Booking');
                } else if (firestoreType === 'hotel') {
                    details = data.hotelName || data.packageName || 'Hotel Booking';
                } else if (firestoreType === 'cab') {
                    details = data.route || data.packageName || 'Cab Booking';
                }

                return {
                    id: b.id,
                    customerName: userData.name || userData.fullname || userData.displayName || 'Guest',
                    customerEmail: userData.email || 'N/A',
                    details: details.trim(),
                    date: data.startDate ? (data.startDate.toDate ? data.startDate.toDate().toISOString().split('T')[0] : data.startDate) : (data.date || ''),
                    amount: Number(amount),
                    commission: Math.round(Number(amount) * 0.1),
                    status: this.mapServiceStatus(data.status || (typeof data.paymentStatus === 'object' ? data.paymentStatus?.status : data.paymentStatus))
                } as ServiceBooking;
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        } catch (error) {
            console.error(`Error fetching ${type} bookings: `, error);
            return [];
        }
    }

    private mapServiceStatus(status: any): 'Confirmed' | 'Pending' | 'Cancelled' | 'Failed' {
        const s = String(status || '').toLowerCase();
        if (s === 'confirmed' || s === 'paid' || s === 'completed' || s === 'success') return 'Confirmed';
        if (s === 'cancelled' || s === 'rejected') return 'Cancelled';
        if (s === 'failed' || s === 'error') return 'Failed';
        return 'Pending';
    }
    async getDashboardStats(): Promise<AdminDashboardStats & { trendData: { name: string, bookings: number }[] }> {
        try {
            console.log('Fetching efficient dashboard stats from Firestore...');

            // 1. Calculate the date 7 days ago for filtered bookings
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            // 2. Fetch counts and recent bookings in parallel
            const [usersCount, forumCount, cardsCount, bookingsCount, recentBookingsSnap] = await Promise.all([
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(collection(db, 'forum_posts')),
                getCountFromServer(collection(db, 'scratchCards')),
                getCountFromServer(collection(db, 'bookings')),
                getDocs(query(
                    collection(db, 'bookings'),
                    orderBy('createdAt', 'desc'),
                    firestoreLimit(100) // Fetch only recent ones for trend calculation (or we could use a date filter)
                ))
            ]);

            // 3. Process Booking Trends (Last 7 days)
            const trendMap: Record<string, number> = {};
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayName = dayNames[date.getDay()];
                const dateString = date.toISOString().split('T')[0];
                trendMap[dateString] = 0;
                last7Days.push({ name: dayName, dateString });
            }

            recentBookingsSnap.forEach(doc => {
                const data = doc.data();
                const createdAt = data.createdAt;
                if (createdAt) {
                    let cDate: string = '';
                    if (createdAt.toDate) {
                        cDate = createdAt.toDate().toISOString().split('T')[0];
                    } else if (typeof createdAt === 'string') {
                        cDate = createdAt.split('T')[0];
                    }

                    if (trendMap[cDate] !== undefined) {
                        trendMap[cDate]++;
                    }
                }
            });

            const trendData = last7Days.map(day => ({
                name: day.name,
                bookings: trendMap[day.dateString]
            }));

            return {
                totalUsers: usersCount.data().count,
                totalBookings: bookingsCount.data().count,
                totalForumPosts: forumCount.data().count,
                totalScratchCards: cardsCount.data().count,
                recentBookings: [],
                recentUsers: [],
                trendData
            };
        } catch (error) {
            console.error('Firestore dashboard fetch failed:', error);
            return {
                totalUsers: 0,
                totalBookings: 0,
                totalForumPosts: 0,
                totalScratchCards: 0,
                recentBookings: [],
                recentUsers: [],
                trendData: []
            };
        }
    }

    async getAllBookings(page: number = 1, limit: number = 10): Promise<{ bookings: AdminBooking[]; total: number }> {
        try {
            // Fetch all bookings from Firestore (Client SDK)
            console.log('Fetching paginated bookings from Firestore...');
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                orderBy('createdAt', 'desc'),
                firestoreLimit(limit)
            );
            const querySnapshot = await getDocs(q);

            const allBookings: AdminBooking[] = [];
            const userIds = new Set<string>();

            querySnapshot.forEach(doc => {
                const data = doc.data() as any;
                if (data.userId) userIds.add(data.userId);

                allBookings.push({
                    id: doc.id,
                    _data: data
                } as any);
            });

            // Fetch user details
            const userMap = new Map<string, any>();
            await Promise.all(Array.from(userIds).map(async (uid) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        userMap.set(uid, userDoc.data());
                    }
                } catch (e) {
                    console.warn(`Failed to fetch user ${uid} `, e);
                }
            }));

            const enrichedBookings = allBookings.map((b: any) => {
                const data = b._data;
                const userData = userMap.get(data.userId) || {};

                return {
                    id: b.id,
                    PackageName: data.packageName || data.PackageName || data.package?.name || data.package?.title || data.name || data.title || data.hotelName || data.hotel_name || data.package_name || 'Unknown Booking',
                    PackageDays: data.packageDays || data.days || data.duration || 1,
                    PackagePrice: data.totalAmount || data.amount || data.price || data.total_amount || data.cost || 0,
                    startDate: data.startDate ? (data.startDate.toDate ? data.startDate.toDate().toISOString() : data.startDate) : (data.travelDate || data.date || ''),
                    people: data.people || data.guests || data.travelers || 1,
                    user: {
                        mobile: userData.mobile || userData.phoneNumber || userData.phone || 'N/A',
                        name: userData.name || userData.fullname || userData.fullName || userData.displayName || 'Guest',
                        email: userData.email,
                    },
                    userId: data.userId, // Populate userId
                    paymentStatus: (typeof data.paymentStatus === 'object' && data.paymentStatus?.status)
                        ? data.paymentStatus.status
                        : (typeof data.paymentStatus === 'string' ? data.paymentStatus : 'pending'),
                    status: data.status || data.bookingStatus || 'pending',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
                    _data: data, // Keep raw data if needed
                } as AdminBooking;
            });

            // Sort by date (newest first)
            enrichedBookings.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

            const total = enrichedBookings.length;
            const startIndex = (page - 1) * limit;
            const paginatedBookings = enrichedBookings.slice(startIndex, startIndex + limit);

            return {
                bookings: paginatedBookings,
                total: total,
            };
        } catch (error) {
            console.error('Error fetching all bookings from Firestore:', error);
            return {
                bookings: [],
                total: 0,
            };
        }
    }

    async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
        try {
            const response = await api.patch(`/ api / v1 / booking / update - status / ${bookingId} `, { status });
            return response.data.success || false;
        } catch (error) {
            console.error('Error updating booking status:', error);
            return false;
        }
    }

    async getUsers(): Promise<AdminUser[]> {
        try {
            const usersRef = collection(db, 'users');
            // Optimizing with orderBy and filtering out affiliates in JS for robustness
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const users: AdminUser[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const role = String(data.role || data.userRole || 'user').toLowerCase();

                // Exclude system/partner roles from the general users list
                if (role === 'affiliate' || role === 'partner' || role === 'admin') return;

                users.push({
                    id: doc.id,
                    name: String(data.name || data.fullname || data.displayName || 'N/A'),
                    email: String(data.email || 'N/A'),
                    mobile: String(data.mobile || data.phoneNumber || data.phone || 'N/A'),
                    role: String(role),
                    status: String(data.status || (data.isDisabled ? 'inactive' : 'active')),
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : new Date().toISOString(),
                    _data: data,
                });
            });
            return users;
        } catch (error) {
            console.error('Error fetching users from Firestore:', error);
            // Fallback to empty array if permission denied or other error
            return [];
        }
    }

    async getPartners(): Promise<AdminPartner[]> {
        try {
            console.log('Fetching partners from Firestore...');
            const partnersRef = collection(db, 'partners');
            const q = query(partnersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const partners: AdminPartner[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                partners.push({
                    id: doc.id,
                    businessName: data.businessName,
                    contactPerson: data.contactPerson || data.name || 'N/A',
                    email: data.email,
                    phone: data.phone || data.mobile,
                    types: data.types || [data.type || 'Hotel'],
                    city: data.city,
                    state: data.state,
                    commission: data.commission || 0,
                    status: data.status || 'Active',
                    verificationStatus: data.verificationStatus || 'pending',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
                });
            });
            return partners;
        } catch (error) {
            console.error('Error fetching partners:', error);
            return [];
        }
    }

    async createPartner(partnerData: Omit<AdminPartner, 'id' | 'createdAt' | 'verificationStatus' | 'status'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'partners'), {
                ...partnerData,
                status: 'Active',
                verificationStatus: 'verified',
                createdAt: serverTimestamp()
            });
            console.log('Partner created with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating partner:', error);
            throw error;
        }
    }

    async deletePartner(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'partners', id));
            console.log('Partner deleted:', id);
        } catch (error) {
            console.error('Error deleting partner:', error);
            throw error;
        }
    }

    async getAffiliates(): Promise<AdminAffiliate[]> {
        try {
            console.log('Fetching affiliates from Firestore...');
            const usersRef = collection(db, 'users');
            // Simplified query to avoid missing index errors
            const q = query(
                usersRef,
                where('referralCode', '>=', '')
            );
            const querySnapshot = await getDocs(q);
            const affiliates: AdminAffiliate[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.referralCode) {
                    affiliates.push({
                        id: doc.id,
                        name: String(data.name || data.fullname || data.displayName || 'N/A'),
                        code: String(data.referralCode || ''),
                        referrals: Number(data.totalReferrals || 0),
                        earnings: Number(data.referralEarnings || 0),
                        status: String(data.status || (data.isDisabled ? 'Inactive' : 'Active')),
                        clicks: Number(data.totalClicks || 0),
                        conversions: Number(data.totalReferrals || 0),
                        convRate: data.totalClicks ? `${((data.totalReferrals || 0) / data.totalClicks * 100).toFixed(2)}%` : '0.00%',
                        website: String(data.website || (data.email ? data.email.split('@')[1] : 'N/A'))
                    });
                }
            });

            // Sort by referral code or createdAt (in JS) if needed
            return affiliates.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.warn('Firestore fetch failed for affiliates:', error);
            return [];
        }
    }

    async createAffiliate(affiliateData: Partial<AdminAffiliate>): Promise<string> {
        try {
            const referralCode = affiliateData.code || `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const docRef = await addDoc(collection(db, 'users'), {
                name: affiliateData.name,
                referralCode,
                website: affiliateData.website,
                totalClicks: 0,
                totalReferrals: 0,
                referralEarnings: 0,
                status: 'Active',
                isDisabled: false,
                role: 'affiliate',
                createdAt: serverTimestamp()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creating affiliate:', error);
            throw error;
        }
    }

    async updateAffiliate(id: string, affiliateData: Partial<AdminAffiliate>): Promise<void> {
        try {
            const docRef = doc(db, 'users', id);
            const updateData: any = {};
            if (affiliateData.name) updateData.name = affiliateData.name;
            if (affiliateData.website) updateData.website = affiliateData.website;
            if (affiliateData.status) {
                updateData.status = affiliateData.status;
                updateData.isDisabled = affiliateData.status === 'Inactive';
            }
            if (affiliateData.code) updateData.referralCode = affiliateData.code;

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error('Error updating affiliate:', error);
            throw error;
        }
    }

    async deleteAffiliate(id: string): Promise<void> {
        try {
            const docRef = doc(db, 'users', id);
            // In many cases we might want to just disable, but user asked for "delete" and it's a management UI
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting affiliate:', error);
            throw error;
        }
    }

    async getHotels(): Promise<AdminHotel[]> {
        try {
            const response = await api.get('/api/v1/admin/hotels'); // Hypothetical endpoint
            return response.data.hotels || [];
        } catch (error) {
            console.warn('Backend API failed, returning empty array:', error);
            return [];
        }
    }

    async getVehicles(type: 'flight' | 'train' | 'cab'): Promise<AdminVehicle[]> {
        try {
            const response = await api.get('/api/v1/admin/vehicles', { params: { type } });
            return response.data.vehicles || [];
        } catch (error) {
            console.warn(`Backend API failed, returning empty array: `, error);
            return [];
        }
    }

    async getPackages(): Promise<AdminPackage[]> {
        try {
            const response = await api.get('/api/v1/admin/packages');
            return response.data.packages || [];
        } catch (error) {
            console.warn('Backend API failed, returning empty array:', error);
            return [];
        }
    }

    async getPackageBookings(): Promise<AdminBooking[]> {
        try {
            // Fetch all bookings to robustly filter by type
            const querySnapshot = await getDocs(collection(db, 'bookings'));

            const bookings: AdminBooking[] = [];
            const userIds = new Set<string>();

            querySnapshot.forEach(doc => {
                const data = doc.data() as any;

                const type = data.type?.toLowerCase() || data.package?.type?.toLowerCase() || '';
                const hasPackageName = data.packageName || data.PackageName || data.package_name || data.package?.name || data.package?.title || data.name || data.title;

                // Exclude known non-package types if type is present
                const isOtherType = ['flight', 'train', 'cab', 'hotel'].includes(type);

                if (!isOtherType && (type === 'tour' || type === 'package' || hasPackageName)) {
                    if (data.userId) userIds.add(data.userId);

                    bookings.push({
                        id: doc.id,
                        // Store raw data temporarily to process later
                        _data: data
                    } as any);
                }
            });

            // ... (rest of the user fetching logic) ...

            const userMap = new Map<string, any>();
            await Promise.all(Array.from(userIds).map(async (uid) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        userMap.set(uid, userDoc.data());
                    }
                } catch (e) {
                    console.warn(`Failed to fetch user ${uid} `, e);
                }
            }));

            const finalBookings = bookings.map((b: any) => {
                const data = b._data;
                const userData = userMap.get(data.userId) || {};

                return {
                    id: b.id,
                    PackageName: data.packageName || data.PackageName || data.package?.name || data.package?.title || data.name || data.title || data.hotelName || data.hotel_name || data.package_name || 'Unknown Booking',
                    PackageDays: data.packageDays || data.days || data.duration || 1,
                    PackagePrice: data.totalAmount || data.amount || data.price || data.total_amount || data.cost || 0,
                    startDate: data.startDate ? (data.startDate.toDate ? data.startDate.toDate().toISOString() : data.startDate) : (data.travelDate ? (data.travelDate.toDate ? data.travelDate.toDate().toISOString() : data.travelDate) : (data.date || '')),
                    people: data.people || data.guests || data.travelers || 1,
                    user: {
                        mobile: userData.mobile || userData.phoneNumber || userData.phone || 'N/A',
                        name: userData.name || userData.fullname || userData.fullName || userData.displayName || 'Guest',
                        email: userData.email,
                    },
                    userId: data.userId, // Populate userId
                    paymentStatus: (typeof data.paymentStatus === 'object' && data.paymentStatus?.status)
                        ? data.paymentStatus.status
                        : (typeof data.paymentStatus === 'string' ? data.paymentStatus : 'pending'),
                    status: data.status || data.bookingStatus || 'pending',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
                    _data: data, // Keep raw data if needed
                };
            });

            return finalBookings.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        } catch (error) {
            console.error('Error fetching package bookings:', error);
            return [];
        }
    }

    async getWalletStats(): Promise<WalletStats> {
        try {
            // 1. Total Revenue from successful bookings
            const bookingsSnap = await getDocs(collection(db, 'bookings'));
            let totalRevenue = 0;
            let todayRevenue = 0;
            const today = new Date().toISOString().split('T')[0];

            bookingsSnap.forEach(doc => {
                const data = doc.data();
                const pStatus = (typeof data.paymentStatus === 'object' && data.paymentStatus?.status)
                    ? data.paymentStatus.status
                    : data.paymentStatus;

                if (pStatus === 'completed' || pStatus === 'Paid' || pStatus === 'paid') {
                    const amount = Number(data.totalAmount || data.PackagePrice || 0);
                    totalRevenue += amount;

                    const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : '';
                    if (createdAt.startsWith(today)) {
                        todayRevenue += amount;
                    }
                }
            });

            // 2. User Wallet Balances
            const usersSnap = await getDocs(collection(db, 'users'));
            let totalWalletBalance = 0;
            usersSnap.forEach(doc => {
                const data = doc.data();
                totalWalletBalance += Number(data.walletBalance || data.CashbackAmount || 0);
            });

            return {
                balance: totalWalletBalance,
                totalEarnings: totalRevenue,
                pendingPayouts: 0, // Placeholder as no payouts collection found yet
                totalWithdrawals: 0 // Placeholder
            };
        } catch (error) {
            console.error('Error fetching real wallet stats:', error);
            return {
                balance: 0,
                totalEarnings: 0,
                pendingPayouts: 0,
                totalWithdrawals: 0
            };
        }
    }

    async getTransactionHistory(): Promise<Transaction[]> {
        try {
            const [bookingsSnap, referralsSnap] = await Promise.all([
                getDocs(collection(db, 'bookings')),
                getDocs(collection(db, 'referralTransactions'))
            ]);

            const transactions: Transaction[] = [];

            // Map Bookings to Transactions
            bookingsSnap.forEach(doc => {
                const data = doc.data();
                const pStatus = (typeof data.paymentStatus === 'object' && data.paymentStatus?.status)
                    ? data.paymentStatus.status
                    : data.paymentStatus;

                if (pStatus === 'completed' || pStatus === 'Paid' || pStatus === 'paid') {
                    transactions.push({
                        id: doc.id,
                        type: 'earning',
                        amount: Number(data.totalAmount || data.PackagePrice || 0),
                        status: 'completed',
                        date: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
                        description: `Booking Payment - ${data.packageName || data.PackageName || 'Package'} `
                    });
                }
            });

            // Map Referrals to Transactions
            referralsSnap.forEach(doc => {
                const data = doc.data();
                transactions.push({
                    id: doc.id,
                    type: data.type === 'REFERRER_CREDIT' ? 'earning' : 'withdrawal', // Simplified mapping
                    amount: data.amount || 0,
                    status: data.status?.toLowerCase() || 'completed',
                    date: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : new Date().toISOString(),
                    description: `Referral Reward - ${data.type} `
                });
            });

            // Sort by date newest first
            return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return [];
        }
    }

    async getUser(userId: string): Promise<AdminUser | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists()) return null;
            const data = userDoc.data();
            return {
                id: userDoc.id,
                name: data.name || data.fullname || data.displayName || 'N/A',
                email: data.email || 'N/A',
                mobile: data.mobile || data.phoneNumber || data.phone || 'N/A',
                role: data.role || data.userRole || 'user',
                status: data.status || (data.isDisabled ? 'inactive' : 'active'),
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : new Date().toISOString(),
                _data: data,
            } as AdminUser;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async getUserBookings(userId: string): Promise<AdminBooking[]> {
        try {
            console.log(`Fetching specific bookings for user ${userId} from Firestore...`);
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);

            const userBookings: AdminBooking[] = [];

            // Since we already have the userId, we don't need to fetch user details again
            // unless we want to ensure we have the latest name/email for the booking display.
            // For now, we'll map the booking data directly.

            querySnapshot.forEach(doc => {
                const data = doc.data() as any;
                userBookings.push({
                    id: doc.id,
                    PackageName: data.packageName || data.PackageName || data.package?.name || data.package?.title || data.name || data.title || data.hotelName || data.hotel_name || data.package_name || 'Unknown Booking',
                    PackageDays: data.packageDays || data.days || data.duration || 1,
                    PackagePrice: data.totalAmount || data.amount || data.price || data.total_amount || data.cost || 0,
                    startDate: data.startDate ? (data.startDate.toDate ? data.startDate.toDate().toISOString() : data.startDate) : (data.travelDate || data.date || ''),
                    people: data.people || data.guests || data.travelers || 1,
                    user: {
                        mobile: data.user?.mobile || 'N/A',
                        name: data.user?.name || 'Guest',
                        email: data.user?.email,
                    },
                    userId: data.userId,
                    paymentStatus: (typeof data.paymentStatus === 'object' && data.paymentStatus?.status)
                        ? data.paymentStatus.status
                        : (typeof data.paymentStatus === 'string' ? data.paymentStatus : 'pending'),
                    status: data.status || data.bookingStatus || 'pending',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
                    _data: data,
                } as AdminBooking);
            });

            return userBookings;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    }


}


export const adminService = new AdminService();
export default adminService;
