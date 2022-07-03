// Imports
import '@testing-library/jest-dom/extend-expect'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved
} from '@testing-library/react';
import React from 'react';

// AzDO related Mocks are loaded automatically (implementations /src/__mocks__)

// Loading samples related mocks

describe('WorkItemFormGroup', () => {

    test('WorkItemFormGroupComponent - rendering', () => {

        const textelement = 'test';
        expect(textelement).toBeDefined();

    });


});


/**
 * Helper Function to delay execution
 */
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
