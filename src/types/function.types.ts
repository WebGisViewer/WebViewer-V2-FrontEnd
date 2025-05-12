// src/types/function.types.ts

/**
 * Layer function definition
 */
export interface LayerFunction {
    id: number;
    name: string;
    description: string;
    function_type: string;
    function_type_display?: string;
    function_config: Record<string, unknown>;
    function_code?: string;
    is_system: boolean;
    created_by_user: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
}

/**
 * Layer function creation request
 */
export interface LayerFunctionCreate {
    name: string;
    description: string;
    function_type: string;
    function_config: Record<string, unknown>;
    function_code?: string;
    is_system: boolean;
}

/**
 * Layer function update request
 */
export type LayerFunctionUpdate = Partial<LayerFunctionCreate>

/**
 * Project layer function association
 */
export interface ProjectLayerFunction {
    id: number;
    project_layer: number;
    layer_name: string;
    layer_function: number;
    function_name: string;
    function_type: string;
    function_arguments: Record<string, unknown>;
    enabled: boolean;
    priority: number;
    created_at: string;
    updated_at: string;
}

/**
 * Project layer function creation request
 */
export interface ProjectLayerFunctionCreate {
    project_layer: number;
    layer_function: number;
    function_arguments: Record<string, unknown>;
    enabled: boolean;
    priority: number;
}

/**
 * Project layer function update request
 */
export type ProjectLayerFunctionUpdate = Partial<ProjectLayerFunctionCreate>

/**
 * Function execution request
 */
export interface FunctionExecuteRequest {
    layer_id: number;
    [key: string]: unknown;
}

/**
 * Function execution response
 */
export interface FunctionExecuteResponse {
    message: string;
    feature_count: number;
    [key: string]: unknown;
}