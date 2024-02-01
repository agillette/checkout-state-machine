import { createMachine } from "xstate";

export const machine = createMachine(
  {
    id: "Checkout",
    initial: "Authenticating",
    context: {
      authError: '',
      inputValid: false,
      success: false,
    },
    states: {
      Authenticating: {
        on: {
          authenticated: {
            target: "Authenticated",
          },
          error: {
            actions: "redirectToLogin",
            target: "Authenticating",
          },
        },
      },
      Authenticated: {
        always: {
          target: "Fetching Payments Details",
        }
      }
      "Fetching Payments Details": {
        on: {
          success: {
            target: "Loaded"
          },
          error: {
            target: "Fetching Payments Details"
          }
        },
      },
      Loaded: {
        on: {
          userInput: {
            target: "Validating Form Data",
          }
          formSubmitted: {
            cond: "isFormValid",
            target: "Payment Pending",    
          }
        }
      },
      "Validating Form Data": {
        // do the validation here
        entry: (context) => context.inputValid = true,
        always: {
          target: "Loaded",
        },
      },
      "Payment Pending": {
        entry: "sendPaymentToAPI",
        always: {
          cond: "didPaymentSucceed",
          target: "Payment Success",
        }
      },
      "Payment Success": {
        type: "final",
      },
      Error: {},
    },
    schema: {},
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      redirectToLogin: (context) => {
        context.authError = "User is not logged in";
      },
      sendPaymentToAPI: (context) => {
        context.success = true;   
      }
    },
    services: {},
    guards: {
      isFormValid: (context) => {
        return context.inputValid;
      },
      didPaymentSucceed: (context) => {
        return context.success;
      }
    },
    delays: {},
  }
);
