# Architecture

The project is organized as follows:

1. Base Code
2. Core
3. Components
4. Shared utilities and constants

## Base Code

This is the code customers paste directly onto their website, assuming they are not using Adobe Launch. It is run before the Alloy library even begins to load. It sets up a global variable the customer can begin using right away. When customers attempt to execute commands before the Alloy library has finished loading, relevant information is stored in a queue. Once the Alloy library finishes loading, the library processes any queued commands. From that time forward, any time a customer attempts to execute a command, the Alloy library will immediately begin executing the command.

The base code is the only piece of source code that is not included in the produced standalone Alloy library.

## Core

Core is the orchestrator of the library. It creates components and manages the lifecycle of the library. Core also provides shared pieces of state and logic to components so they can properly perform their job. Core also exposes a limited number of commands that are fundamental to the library as a whole, like `configure` and `setDebug`.

## Components

Components provide the bulk of functionality. This functionality is typically exposed through commands that customers use to perform their work. Components are organized by areas of concern. For example, Identity and Personalization are different components.

Components are largely decoupled. A component never interacts directly with another component and should never import a module contained within a different component. In fact, components should never import modules contained outside their component directory, with the exception of shared utilities and constants. Any coordination that must exist between components or between a component and Core should be explicitly defined and provided by Core to all instances, either through arguments when Core is creating components or through [lifecycle hooks](lifecycle.md).

Similarly, Core should never import modules contained within components. The only exception to this rule is when Core imports the component factory functions in order to instantiate the components. 

## Shared Utilities And Constants

Utilities and constants that are not specific to a particular component may reside in `src/utils` and `src/constants`. These are the only modules that a component may import that reside outside of that component's directory.

A utility or constant does not need to be in active use by more than one component (or Core) for it to be in `src/utils` or `src/constants`. If it could be reasonably useful (which is subjective) to more than one component, it would qualify. This approach to qualification allows developers to more easily discover utilities and constants that already exist, rather than accidentally creating redundant utilities and constants in different components.

Utilities should never be used to communicate or share state across components.


