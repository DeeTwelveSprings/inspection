import { Injectable } from '@angular/core';

Injectable()
export class GlobalConstants {
    pageTitle: string = '';
    login: string = 'v1/login';
    getInspectorList: string = 'v1/getAllInspector';
    getInspectorById: string = 'v1/getOfficerDetails';
    saveInspector: string = 'v1/saveOfficer';
    updateInspector: string = 'v1/updateOfficer';

    getBookingList: string = "v1/booking";
    saveBooking: string = 'v1/booking';
    updateBooking: string = 'v1/booking/updateBooking';
    cancelBooking: string = 'v1/booking/bookingStatusUpdate';
    getBookingById: string = 'v1/booking/getBooking';
    sendEmail: string = 'v1/booking/sendPaymentLinkEmail';
    getFilterBookingList = 'v1/booking/getTypeWiseBookings';
    pendingBookingList = 'v1/booking/pendingBookings';
    alertBookingList = 'v1/booking/bookingAlerts';

    saveBookingNotes: string = 'v1/bookingNotes/notes';
    getBookingNotes: string = 'v1/bookingNotes/getNotes';

    getAgentList: string = 'v1/agents';
    getAvailableSlots: string = 'v1/booking/getBookingSlot';

    getPricing: string = 'v1/booking/getPrices';
    getDashboard: string = 'v1/booking/getDashboardCounts';
    getInspectorDetalils: string = 'v1/officer/getOfficerName';
    getBlockOffList: string = 'v1/bookingslot/getOffInspectorList';
     

    saveBlockSlot = 'v1/bookingslot';
    getBlockSlot = 'v1/bookingslot/getBookingSlotByInspectorId';
    updateBlockslot = "v1/bookingslot/updateBookingSlot";
    deleteBlockSlot = "v1/bookingslot/deleteBookingSlot";

    updateBookingInspection = 'v1/booking/updateBookingOfficerId';
    getReassignOfficer = "v1/officer/getOfficerNameList";
    updateBookingReschedule = 'v1/booking/rescheduleBookingOfficer';

    dashboardFilter = 'v1/booking/getOfficerBoookings';
    dashboardBookingList = 'v1/booking/getDashboardBookingList';
    dashboardMonthBookingList = 'v1/booking/getDashboardMonthWiseBookingList';
    dashboardWeekBookingList = 'v1/booking/getDashboardWeekWiseBookingList';
    dashboarSearch = 'v1/booking/getBookingsByDetails';

    /*--- users ---*/
    getusersList: string = 'v1/getAllUsers';
    getUserById: string = 'v1/getUserById';
    saveUser: string = 'v1/createUser';
    updateUser: string = 'v1/updateUser';
    deleteUser: string = 'v1/deleteUser';

    saveAgent: string= 'v1/agents/saveAgent';
    sendConfirmationEmail: string = 'v1/booking/sendEmail';
    getTemplates: string = 'v1/booking/getEmailTemplates';


    saveBookingv2: string = 'v1/booking/saveBookingv2';
    updateBookingv2: string = 'v1/booking/updateBookingv2';
    blockSlotAPIv2: string = 'v1/officer/getOfficerNamev2';
    getBookingDataV2: string = 'v1/booking/getBookingv2';

    reinspectionAPIV2: string = 'v1/booking/saveReinspection';
    abandonedList: string = 'v1/incomplete/getIncompleteInspection';
    deleteAbondonedList: string = 'v1/incomplete/deleteIncompleteInspectionById'

    getAbandonedEntry: string = 'v1/incomplete/getIncompleteInspectionById';

    getWebsiteBookings: string = 'v1/booking/websiteBookings';
    getEmailSMSlog: string = 'v1/booking/getEmailSmsLogsByBooking';
    sendFormPetUtility: string = 'v1/booking/sendForm';

    getBookingListFilter: string = 'v1/booking/filterBooking';

    /*---- Credentials ---*/
    getCredentials: string = 'v1/credential/getCredentials';
    getCredentialLog: string = 'v1/credential/getCredentialsLogs';
    updateCrendentail: string = 'v1/credential/updateCredentials';
}