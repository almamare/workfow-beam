import { configureStore } from '@reduxjs/toolkit';                  // Importing the Redux Toolkit's configureStore function
import Login from '@/stores/slices/login';                          // Importing the login slice from the slices directory
import Project from '@/stores/slices/projects';                     // Importing the Project type from the projects slice
import Tender from '@/stores/slices/tenders';                       // Importing the Tender type from the types directory
import budget from '@/stores/slices/budgets';                       // Importing the Budget type from the budgets slice
import taskOrders from '@/stores/slices/task-orders';               // Importing the TaskOrder type from the task-orders slice
import Clients from '@/stores/slices/clients';                      // Importing the Clients type from the clients slice
import Contractors from '@/stores/slices/contractors';              // Importing the Contractors type from the contractors slice
import UsersSil from '@/stores/slices/users';                       // Importing the Users type from the users slice
import Employees from '@/stores/slices/employees';                  // Importing the Employees type from the employees slice
import TaskRequests from '@/stores/slices/tasks_requests';          // Importing the TaskRequests type from the tasks_requests slice
import ClientRequests from '@/stores/slices/clients_requests';      // Importing the ClientRequests type from the clients_requests slice
import Notifications from '@/stores/slices/notifications';          // Importing the Notifications slice
import Forms from '@/stores/slices/forms';                          // Importing the Forms slice
import Documents from '@/stores/slices/documents';                  // Importing the Documents slice
import Banks from '@/stores/slices/banks';                          // Importing the Banks slice
import Invoices from '@/stores/slices/invoices';                    // Importing the Invoices slice
import BankBalances from '@/stores/slices/bank-balances';           // Importing the Bank Balances slice
import Approvals from '@/stores/slices/approvals';                  // Importing the Approvals slice
import ClientContracts from '@/stores/slices/client-contracts';     // Importing the Client Contracts slice
import Attachments from '@/stores/slices/attachments';              // Importing the Attachments slice
import ContractorPayments from '@/stores/slices/contractor-payments'; // Importing the Contractor Payments slice
import TasksRequestsForApproval from '@/stores/slices/tasks_requests_for_approval'; // Importing the Tasks Requests For Approval slice
import ClientsRequestsForApproval from '@/stores/slices/clients_requests_for_approval'; // Importing the Clients Requests For Approval slice


// This is the Redux store configuration for the login functionality
// It uses the Redux Toolkit to create a store with a single slice for login.
const store = configureStore({
    reducer: {
        login: Login,                       // This is the slice for login functionality
        projects: Project,                  // This is the slice for project management functionality
        tenders: Tender,                    // This is a reducer for managing tenders, which is an array of Tender objects
        budgets: budget,                    // This is the slice for budget management functionality
        taskOrders: taskOrders,             // This is the slice for managing task orders 
        clients: Clients,                   // This is the slice for managing clients
        contractors: Contractors,           // This is the slice for managing contractors
        users: UsersSil,                    //
        employees: Employees,
        taskRequests: TaskRequests,
        tasksRequestsForApproval: TasksRequestsForApproval, // This is the slice for managing task requests pending approval
        clientsRequestsForApproval: ClientsRequestsForApproval, // This is the slice for managing client requests pending approval
        clientRequests: ClientRequests,      // This is the slice for managing client requests
        notifications: Notifications,       // This is the slice for managing notifications
        forms: Forms,                       // This is the slice for managing forms
        documents: Documents,               // This is the slice for managing documents
        banks: Banks,                       // This is the slice for managing banks
        invoices: Invoices,                 // This is the slice for managing invoices
        bankBalances: BankBalances,         // This is the slice for managing bank balances
        approvals: Approvals,               // This is the slice for managing approvals
        clientContracts: ClientContracts,  // This is the slice for managing client contracts
        attachments: Attachments,           // This is the slice for managing attachments
        contractorPayments: ContractorPayments // This is the slice for managing contractor payments
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types from serialization check
                ignoredActions: ['forms/downloadFormPDF/fulfilled'],
            },
        }),
});


// Exporting the types for the root state and dispatch
// These types are useful for TypeScript to infer the types of the state and dispatch functions.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 