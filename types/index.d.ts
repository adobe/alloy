/**
 * Options for creating an Alloy instance.
 * 
 * @see AlloyInstance
 */
export interface InstanceOptions {
  /**
   * The name of the instance.
   * @default "alloy"
   */
  name?: string;

  /**
   * An array of monitor objects for the instance.
   */
  monitors?: Array<Record<string, unknown>>;
}

/**
 * Executes a command on the Alloy instance.
 * 
 * @param command - The name of the command to execute.
 * @param options - Additional options for the command.
 * @returns A promise if the command is asynchronous, or void if it is synchronous.
 */
export interface AlloyInstance {
  (command: string, options?: Record<string, unknown>): Promise<unknown> | void;
}

/**
 * Creates a new Alloy instance.
 * 
 * @param options - Configuration options for the instance.
 * @returns A callable Alloy instance.
 * 
 * @example
 * const alloy = createInstance({ name: "myInstance" });
 * alloy("configure", { datastreamId: "myDatastreamId", orgId: "myOrgId" });
 */
export function createInstance(options?: InstanceOptions): AlloyInstance;