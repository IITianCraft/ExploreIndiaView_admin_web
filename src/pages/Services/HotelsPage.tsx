import ServiceManagementPage from '@/components/Services/ServiceManagementPage';
import { Building2 } from 'lucide-react';

export default function HotelsPage() {
    return (
        <ServiceManagementPage
            type="hotels"
            title="Hotels Management"
            description="View and manage all hotel bookings."
            icon={<Building2 size={24} />}
        />
    );
}
