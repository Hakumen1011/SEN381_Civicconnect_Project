ALTER TABLE service_requests DROP CONSTRAINT service_requests_category_check;
 
ALTER TABLE service_requests ADD CONSTRAINT service_requests_category_check
    CHECK (category IN (
        'FACILITY_FAULT', 'DAMAGED_EQUIPMENT', 'SECURITY_CONCERN',
        'IT_SUPPORT', 'MAINTENANCE', 'LOST_PROPERTY', 'OTHER',
        'ROAD_PAVEMENT', 'STREET_LIGHTING', 'STORMWATER_DRAIN',
        'SOLID_WASTE', 'PARKS_GREENERY', 'CODE_COMPLIANCE'));