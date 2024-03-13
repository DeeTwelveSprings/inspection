export class BookingModel{
    id: string;
    inspectionType:string;
    inspectionSubType: string;
    address:string;
    unit: string;
    city: string;
    state: string;
    zipcode: string;
    squareFeet: string;
    yearBuilt: string;
    foundation: string;
    firstName: string;
    lastName: string;
    secondaryFullName: string;
    secondaryPhone: string;
    secondaryEmail: string;
    transFullName:string;
    transPhone: string;
    transEmail: string;
    email: string;
    ccEmail: string;
    phone: string;
    agentName: string;
    agentPhone: string;
    agentEmail: string;
    sellerAgentName: string;
    sellerAgentPhone: string;
    sellerAgentEmail: string;
    inspectionDate: any;
    inspectionTime: string;
    packageName: string;
    packagePrice: number;
    calculatedPrice: number;
    reportreView: string;
    comments: string;
    officerId: string;
    officerName: string;
    additionalServices: string;
    additionalServiceCost: number;
    paymentStatus: string = 'PENDING';
    latitude: string;
    longitude: string;
    bookingType: string;
    //timeZone: string;

    buildingType: string;
    dwelling: string;
    stories: string;
    rooms: string;
    bedrooms: string;
    bathrooms: string;
    status: string;
    reinspection: string;
    reinspectionComments: string;
    op1: boolean;
    op2: boolean;
    op3: boolean;
    op4: boolean;
    op5: boolean;
    op6: boolean;
    op7: boolean;
    op8: boolean;
    inspectionEndTime: any;
    duration: string;
    buyerSubscribe: string;
    buyerAgentSubscribe: string;
    sellerAgentSubscribe: string;
}

export class reassignModel{
    type: string;
    inspectionNewDate: string;
    inspectionNewTime: string;
    inspectionNewDuration: string;
    inspectionNewEndTime: string;
    saveEndTime: String;
    saveDuration:string;
    bookingId: string;
    inspectorId: string;
}

export class notesModel{
    id: string;
    bookingId: string;
    notes: string;
    createdBy: string;
}

export class agentModel{
    id: string;
    name: string;
    license:string;
    phone: string;
    email: string;
    address: string;
    companyName: string;
    notes: string;
}

export class emailModel{
    templateId: string;
    bookingId: string;
    to: string;
    cc:string;
    bcc: string;
    message: string;
    salutation: string;
    address: boolean;
    time: boolean;
    fee: boolean;
    duration: boolean;
    subject: string;
    includeLink: boolean;
    contract: boolean;

    inspectorName:boolean;
    inspectorLicense: boolean;
    consultationTime: boolean;
}