import ServiceManagementPage from '@/components/Services/ServiceManagementPage';
import { Train } from 'lucide-react';

export default function TrainsPage() {
    return (
        <ServiceManagementPage
            type="trains"
            title="Trains Management"
            description="View and manage all trains bookings."
            icon={<Train size={24} />}
        />
    );
}
