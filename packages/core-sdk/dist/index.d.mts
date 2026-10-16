import * as viem__types_actions_token from 'viem/_types/actions/token';
import * as viem__types_actions_siwe_verifySiweMessage from 'viem/_types/actions/siwe/verifySiweMessage';
import * as viem__types_utils_ccip from 'viem/_types/utils/ccip';
import * as viem from 'viem';
import { Chain } from 'viem';
import * as anchor from '@coral-xyz/anchor';
export { anchor };
import { PublicKey } from '@solana/web3.js';
export { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

/**
 * Create an Anchor provider from a Solana RPC endpoint and a wallet.
 */
declare function createAnchorProvider(endpoint: string, wallet: anchor.Wallet, opts?: anchor.web3.ConfirmOptions): anchor.AnchorProvider;
/**
 * Load a deployed Anchor program by its IDL and Program ID.
 */
declare function loadProgram<T extends anchor.Idl>(idl: T, programId: PublicKey, provider: anchor.AnchorProvider): anchor.Program<T>;
/**
 * Create a viem public client for an EVM-compatible chain (e.g. App-Chain Genesis).
 */
declare function createEvmClient(rpcUrl: string, chain: Chain): {
    account: undefined;
    batch?: {
        multicall?: boolean | viem.Prettify<viem.MulticallBatchOptions> | undefined;
    } | undefined;
    cacheTime: number;
    ccipRead?: false | {
        request?: (parameters: viem.CcipRequestParameters) => Promise<viem__types_utils_ccip.CcipRequestReturnType>;
    } | undefined;
    chain: Chain;
    dataSuffix?: viem.DataSuffix | undefined;
    experimental_blockTag?: viem.BlockTag | undefined;
    key: string;
    name: string;
    pollingInterval: number;
    request: viem.EIP1193RequestFn<viem.PublicRpcSchema>;
    tokens: undefined;
    transport: viem.TransportConfig<"http", viem.EIP1193RequestFn> & {
        fetchOptions?: viem.HttpTransportConfig["fetchOptions"] | undefined;
        url?: string | undefined;
    };
    type: string;
    uid: string;
    call: (parameters: viem.CallParameters<Chain>) => Promise<viem.CallReturnType>;
    createAccessList: (parameters: viem.CreateAccessListParameters<Chain>) => Promise<{
        accessList: viem.AccessList;
        gasUsed: bigint;
    }>;
    createBlockFilter: () => Promise<viem.CreateBlockFilterReturnType>;
    createContractEventFilter: <const abi extends viem.Abi | readonly unknown[], eventName extends viem.ContractEventName<abi> | undefined, args extends viem.MaybeExtractEventArgsFromAbi<abi, eventName> | undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined>(args: viem.CreateContractEventFilterParameters<abi, eventName, args, strict, fromBlock, toBlock>) => Promise<viem.CreateContractEventFilterReturnType<abi, eventName, args, strict, fromBlock, toBlock>>;
    createEventFilter: <const abiEvent extends viem.AbiEvent | undefined = undefined, const abiEvents extends readonly viem.AbiEvent[] | readonly unknown[] | undefined = abiEvent extends viem.AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, _EventName extends string | undefined = viem.MaybeAbiEventName<abiEvent>, _Args extends viem.MaybeExtractEventArgsFromAbi<abiEvents, _EventName> | undefined = undefined>(args?: viem.CreateEventFilterParameters<abiEvent, abiEvents, strict, fromBlock, toBlock, _EventName, _Args> | undefined) => Promise<viem.CreateEventFilterReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock, _EventName, _Args>>;
    createPendingTransactionFilter: () => Promise<viem.CreatePendingTransactionFilterReturnType>;
    estimateContractGas: <chain extends Chain | undefined, const abi extends viem.Abi | readonly unknown[], functionName extends viem.ContractFunctionName<abi, "nonpayable" | "payable">, args extends viem.ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>>(args: viem.EstimateContractGasParameters<abi, functionName, args, chain>) => Promise<viem.EstimateContractGasReturnType>;
    estimateGas: (args: viem.EstimateGasParameters<Chain>) => Promise<viem.EstimateGasReturnType>;
    fillTransaction: <chainOverride extends Chain | undefined = undefined, accountOverride extends viem.Account | viem.Address | undefined = undefined>(args: viem.FillTransactionParameters<Chain, undefined, chainOverride, accountOverride>) => Promise<viem.FillTransactionReturnType<Chain, chainOverride>>;
    getBalance: (args: viem.GetBalanceParameters) => Promise<viem.GetBalanceReturnType>;
    getBlobBaseFee: () => Promise<viem.GetBlobBaseFeeReturnType>;
    getBlock: <includeTransactions extends boolean = false, blockTag extends viem.BlockTag = "latest">(args?: viem.GetBlockParameters<includeTransactions, blockTag> | undefined) => Promise<{
        number: blockTag extends "pending" ? null : bigint;
        hash: blockTag extends "pending" ? null : `0x${string}`;
        nonce: blockTag extends "pending" ? null : `0x${string}`;
        logsBloom: blockTag extends "pending" ? null : `0x${string}`;
        baseFeePerGas: bigint | null;
        blobGasUsed: bigint;
        difficulty: bigint;
        excessBlobGas: bigint;
        extraData: viem.Hex;
        gasLimit: bigint;
        gasUsed: bigint;
        miner: viem.Address;
        mixHash: viem.Hash;
        parentBeaconBlockRoot?: `0x${string}` | undefined;
        parentHash: viem.Hash;
        receiptsRoot: viem.Hex;
        sealFields: viem.Hex[];
        sha3Uncles: viem.Hash;
        size: bigint;
        stateRoot: viem.Hash;
        timestamp: bigint;
        totalDifficulty: bigint | null;
        transactionsRoot: viem.Hash;
        uncles: viem.Hash[];
        withdrawals?: viem.Withdrawal[] | undefined | undefined;
        withdrawalsRoot?: `0x${string}` | undefined;
        transactions: includeTransactions extends true ? ({
            yParity?: undefined | undefined;
            blockTimestamp?: bigint | undefined;
            from: viem.Address;
            gas: bigint;
            hash: viem.Hash;
            input: viem.Hex;
            nonce: number;
            r: viem.Hex;
            s: viem.Hex;
            to: viem.Address | null;
            typeHex: viem.Hex | null;
            v: bigint;
            value: bigint;
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            chainId?: number | undefined;
            type: "legacy";
            gasPrice: bigint;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T ? T extends (blockTag extends "pending" ? true : false) ? T extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_1 ? T_1 extends (blockTag extends "pending" ? true : false) ? T_1 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_2 ? T_2 extends (blockTag extends "pending" ? true : false) ? T_2 extends true ? null : number : never : never;
        } | {
            yParity: number;
            blockTimestamp?: bigint | undefined;
            from: viem.Address;
            gas: bigint;
            hash: viem.Hash;
            input: viem.Hex;
            nonce: number;
            r: viem.Hex;
            s: viem.Hex;
            to: viem.Address | null;
            typeHex: viem.Hex | null;
            v: bigint;
            value: bigint;
            accessList: viem.AccessList;
            authorizationList?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            chainId: number;
            type: "eip2930";
            gasPrice: bigint;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_3 ? T_3 extends (blockTag extends "pending" ? true : false) ? T_3 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_4 ? T_4 extends (blockTag extends "pending" ? true : false) ? T_4 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_5 ? T_5 extends (blockTag extends "pending" ? true : false) ? T_5 extends true ? null : number : never : never;
        } | {
            yParity: number;
            blockTimestamp?: bigint | undefined;
            from: viem.Address;
            gas: bigint;
            hash: viem.Hash;
            input: viem.Hex;
            nonce: number;
            r: viem.Hex;
            s: viem.Hex;
            to: viem.Address | null;
            typeHex: viem.Hex | null;
            v: bigint;
            value: bigint;
            accessList: viem.AccessList;
            authorizationList?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            chainId: number;
            type: "eip1559";
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_6 ? T_6 extends (blockTag extends "pending" ? true : false) ? T_6 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_7 ? T_7 extends (blockTag extends "pending" ? true : false) ? T_7 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_8 ? T_8 extends (blockTag extends "pending" ? true : false) ? T_8 extends true ? null : number : never : never;
        } | {
            yParity: number;
            blockTimestamp?: bigint | undefined;
            from: viem.Address;
            gas: bigint;
            hash: viem.Hash;
            input: viem.Hex;
            nonce: number;
            r: viem.Hex;
            s: viem.Hex;
            to: viem.Address | null;
            typeHex: viem.Hex | null;
            v: bigint;
            value: bigint;
            accessList: viem.AccessList;
            authorizationList?: undefined | undefined;
            blobVersionedHashes: readonly viem.Hex[];
            chainId: number;
            type: "eip4844";
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas: bigint;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_9 ? T_9 extends (blockTag extends "pending" ? true : false) ? T_9 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_10 ? T_10 extends (blockTag extends "pending" ? true : false) ? T_10 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_11 ? T_11 extends (blockTag extends "pending" ? true : false) ? T_11 extends true ? null : number : never : never;
        } | {
            yParity: number;
            blockTimestamp?: bigint | undefined;
            from: viem.Address;
            gas: bigint;
            hash: viem.Hash;
            input: viem.Hex;
            nonce: number;
            r: viem.Hex;
            s: viem.Hex;
            to: viem.Address | null;
            typeHex: viem.Hex | null;
            v: bigint;
            value: bigint;
            accessList: viem.AccessList;
            authorizationList: viem.SignedAuthorizationList;
            blobVersionedHashes?: undefined | undefined;
            chainId: number;
            type: "eip7702";
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_12 ? T_12 extends (blockTag extends "pending" ? true : false) ? T_12 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_13 ? T_13 extends (blockTag extends "pending" ? true : false) ? T_13 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_14 ? T_14 extends (blockTag extends "pending" ? true : false) ? T_14 extends true ? null : number : never : never;
        })[] : `0x${string}`[];
    }>;
    getBlockReceipts: (args?: viem.GetBlockReceiptsParameters | undefined) => Promise<viem.GetBlockReceiptsReturnType<Chain>>;
    getBlockNumber: (args?: viem.GetBlockNumberParameters | undefined) => Promise<viem.GetBlockNumberReturnType>;
    getBlockTransactionCount: (args?: viem.GetBlockTransactionCountParameters | undefined) => Promise<viem.GetBlockTransactionCountReturnType>;
    getBytecode: (args: viem.GetBytecodeParameters) => Promise<viem.GetBytecodeReturnType>;
    getChainId: () => Promise<viem.GetChainIdReturnType>;
    getCode: (args: viem.GetBytecodeParameters) => Promise<viem.GetBytecodeReturnType>;
    getContractEvents: <const abi extends viem.Abi | readonly unknown[], eventName extends viem.ContractEventName<abi> | undefined = undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined>(args: viem.GetContractEventsParameters<abi, eventName, strict, fromBlock, toBlock>) => Promise<viem.GetContractEventsReturnType<abi, eventName, strict, fromBlock, toBlock>>;
    getDelegation: (args: viem.GetDelegationParameters) => Promise<viem.GetDelegationReturnType>;
    getEip712Domain: (args: viem.GetEip712DomainParameters) => Promise<viem.GetEip712DomainReturnType>;
    getEnsAddress: (args: viem.GetEnsAddressParameters) => Promise<viem.GetEnsAddressReturnType>;
    getEnsAvatar: (args: viem.GetEnsAvatarParameters) => Promise<viem.GetEnsAvatarReturnType>;
    getEnsName: (args: viem.GetEnsNameParameters) => Promise<viem.GetEnsNameReturnType>;
    getEnsResolver: (args: viem.GetEnsResolverParameters) => Promise<viem.GetEnsResolverReturnType>;
    getEnsText: (args: viem.GetEnsTextParameters) => Promise<viem.GetEnsTextReturnType>;
    getFeeHistory: (args: viem.GetFeeHistoryParameters) => Promise<viem.GetFeeHistoryReturnType>;
    estimateFeesPerGas: <chainOverride extends Chain | undefined = undefined, type extends viem.FeeValuesType = "eip1559">(args?: viem.EstimateFeesPerGasParameters<Chain, chainOverride, type> | undefined) => Promise<viem.EstimateFeesPerGasReturnType<type>>;
    getFilterChanges: <filterType extends viem.FilterType, const abi extends viem.Abi | readonly unknown[] | undefined, eventName extends string | undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined>(args: viem.GetFilterChangesParameters<filterType, abi, eventName, strict, fromBlock, toBlock>) => Promise<viem.GetFilterChangesReturnType<filterType, abi, eventName, strict, fromBlock, toBlock>>;
    getFilterLogs: <const abi extends viem.Abi | readonly unknown[] | undefined, eventName extends string | undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined>(args: viem.GetFilterLogsParameters<abi, eventName, strict, fromBlock, toBlock>) => Promise<viem.GetFilterLogsReturnType<abi, eventName, strict, fromBlock, toBlock>>;
    getGasPrice: () => Promise<viem.GetGasPriceReturnType>;
    getLogs: <const abiEvent extends viem.AbiEvent | undefined = undefined, const abiEvents extends readonly viem.AbiEvent[] | readonly unknown[] | undefined = abiEvent extends viem.AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined, fromBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined, toBlock extends viem.BlockNumber | viem.BlockTag | undefined = undefined>(args?: viem.GetLogsParameters<abiEvent, abiEvents, strict, fromBlock, toBlock> | undefined) => Promise<viem.GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>>;
    getProof: (args: viem.GetProofParameters) => Promise<viem.GetProofReturnType>;
    estimateMaxPriorityFeePerGas: <chainOverride extends Chain | undefined = undefined>(args?: {
        chain?: chainOverride | null | undefined;
    } | undefined) => Promise<viem.EstimateMaxPriorityFeePerGasReturnType>;
    getRawTransaction: (args: viem.GetRawTransactionParameters) => Promise<viem.GetRawTransactionReturnType>;
    getStorageAt: (args: viem.GetStorageAtParameters) => Promise<viem.GetStorageAtReturnType>;
    getTransaction: <blockTag extends viem.BlockTag = "latest">(args: viem.GetTransactionParameters<blockTag>) => Promise<{
        yParity?: undefined | undefined;
        blockTimestamp?: bigint | undefined;
        from: viem.Address;
        gas: bigint;
        hash: viem.Hash;
        input: viem.Hex;
        nonce: number;
        r: viem.Hex;
        s: viem.Hex;
        to: viem.Address | null;
        typeHex: viem.Hex | null;
        v: bigint;
        value: bigint;
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        chainId?: number | undefined;
        type: "legacy";
        gasPrice: bigint;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T ? T extends (blockTag extends "pending" ? true : false) ? T extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_1 ? T_1 extends (blockTag extends "pending" ? true : false) ? T_1 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_2 ? T_2 extends (blockTag extends "pending" ? true : false) ? T_2 extends true ? null : number : never : never;
    } | {
        yParity: number;
        blockTimestamp?: bigint | undefined;
        from: viem.Address;
        gas: bigint;
        hash: viem.Hash;
        input: viem.Hex;
        nonce: number;
        r: viem.Hex;
        s: viem.Hex;
        to: viem.Address | null;
        typeHex: viem.Hex | null;
        v: bigint;
        value: bigint;
        accessList: viem.AccessList;
        authorizationList?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        chainId: number;
        type: "eip2930";
        gasPrice: bigint;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_3 ? T_3 extends (blockTag extends "pending" ? true : false) ? T_3 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_4 ? T_4 extends (blockTag extends "pending" ? true : false) ? T_4 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_5 ? T_5 extends (blockTag extends "pending" ? true : false) ? T_5 extends true ? null : number : never : never;
    } | {
        yParity: number;
        blockTimestamp?: bigint | undefined;
        from: viem.Address;
        gas: bigint;
        hash: viem.Hash;
        input: viem.Hex;
        nonce: number;
        r: viem.Hex;
        s: viem.Hex;
        to: viem.Address | null;
        typeHex: viem.Hex | null;
        v: bigint;
        value: bigint;
        accessList: viem.AccessList;
        authorizationList?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        chainId: number;
        type: "eip1559";
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_6 ? T_6 extends (blockTag extends "pending" ? true : false) ? T_6 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_7 ? T_7 extends (blockTag extends "pending" ? true : false) ? T_7 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_8 ? T_8 extends (blockTag extends "pending" ? true : false) ? T_8 extends true ? null : number : never : never;
    } | {
        yParity: number;
        blockTimestamp?: bigint | undefined;
        from: viem.Address;
        gas: bigint;
        hash: viem.Hash;
        input: viem.Hex;
        nonce: number;
        r: viem.Hex;
        s: viem.Hex;
        to: viem.Address | null;
        typeHex: viem.Hex | null;
        v: bigint;
        value: bigint;
        accessList: viem.AccessList;
        authorizationList?: undefined | undefined;
        blobVersionedHashes: readonly viem.Hex[];
        chainId: number;
        type: "eip4844";
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas: bigint;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_9 ? T_9 extends (blockTag extends "pending" ? true : false) ? T_9 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_10 ? T_10 extends (blockTag extends "pending" ? true : false) ? T_10 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_11 ? T_11 extends (blockTag extends "pending" ? true : false) ? T_11 extends true ? null : number : never : never;
    } | {
        yParity: number;
        blockTimestamp?: bigint | undefined;
        from: viem.Address;
        gas: bigint;
        hash: viem.Hash;
        input: viem.Hex;
        nonce: number;
        r: viem.Hex;
        s: viem.Hex;
        to: viem.Address | null;
        typeHex: viem.Hex | null;
        v: bigint;
        value: bigint;
        accessList: viem.AccessList;
        authorizationList: viem.SignedAuthorizationList;
        blobVersionedHashes?: undefined | undefined;
        chainId: number;
        type: "eip7702";
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_12 ? T_12 extends (blockTag extends "pending" ? true : false) ? T_12 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_13 ? T_13 extends (blockTag extends "pending" ? true : false) ? T_13 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_14 ? T_14 extends (blockTag extends "pending" ? true : false) ? T_14 extends true ? null : number : never : never;
    }>;
    getTransactionConfirmations: (args: viem.GetTransactionConfirmationsParameters<Chain>) => Promise<viem.GetTransactionConfirmationsReturnType>;
    getTransactionCount: (args: viem.GetTransactionCountParameters) => Promise<viem.GetTransactionCountReturnType>;
    getTransactionReceipt: (args: viem.GetTransactionReceiptParameters) => Promise<viem.TransactionReceipt>;
    multicall: <const contracts extends readonly unknown[], allowFailure extends boolean = true>(args: viem.MulticallParameters<contracts, allowFailure>) => Promise<viem.MulticallReturnType<contracts, allowFailure>>;
    prepareTransactionRequest: <const request extends viem.PrepareTransactionRequestRequest<Chain, chainOverride>, chainOverride extends Chain | undefined = undefined, accountOverride extends viem.Account | viem.Address | undefined = undefined>(args: viem.PrepareTransactionRequestParameters<Chain, undefined, chainOverride, accountOverride, request>) => Promise<viem.UnionRequiredBy<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> & (viem.DeriveChain<Chain, chainOverride> extends infer T_1 ? T_1 extends viem.DeriveChain<Chain, chainOverride> ? T_1 extends Chain ? {
        chain: T_1;
    } : {
        chain?: undefined;
    } : never : never) & (viem.DeriveAccount<undefined, accountOverride> extends infer T_2 ? T_2 extends viem.DeriveAccount<undefined, accountOverride> ? T_2 extends viem.Account ? {
        account: T_2;
        from: viem.Address;
    } : {
        account?: undefined;
        from?: undefined;
    } : never : never), viem.IsNever<viem.ExtractFormattedTransactionRequest<viem.DeriveChain<Chain, chainOverride>, {
        type?: ((request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_3 ? T_3 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_3 extends object ? request extends viem.ExactPartial<T_3> ? T_3 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_4 ? T_4 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_4 extends object ? request extends viem.ExactPartial<T_4> ? T_4 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_5 ? T_5 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_5 extends object ? request extends viem.ExactPartial<T_5> ? T_5 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_6 ? T_6 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_6 extends object ? request extends viem.ExactPartial<T_6> ? T_6 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) extends infer T_7 ? T_7 extends (request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_8 ? T_8 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_8 extends object ? request extends viem.ExactPartial<T_8> ? T_8 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_9 ? T_9 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_9 extends object ? request extends viem.ExactPartial<T_9> ? T_9 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_10 ? T_10 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_10 extends object ? request extends viem.ExactPartial<T_10> ? T_10 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_11 ? T_11 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_11 extends object ? request extends viem.ExactPartial<T_11> ? T_11 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) ? T_7 extends string ? T_7 : undefined : never : never) | undefined;
    }, viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from">, ((request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_12 ? T_12 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_12 extends object ? request extends viem.ExactPartial<T_12> ? T_12 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_13 ? T_13 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_13 extends object ? request extends viem.ExactPartial<T_13> ? T_13 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_14 ? T_14 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_14 extends object ? request extends viem.ExactPartial<T_14> ? T_14 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_15 ? T_15 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_15 extends object ? request extends viem.ExactPartial<T_15> ? T_15 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) extends infer T_16 ? T_16 extends (request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_17 ? T_17 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_17 extends object ? request extends viem.ExactPartial<T_17> ? T_17 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_18 ? T_18 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_18 extends object ? request extends viem.ExactPartial<T_18> ? T_18 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_19 ? T_19 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_19 extends object ? request extends viem.ExactPartial<T_19> ? T_19 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_20 ? T_20 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_20 extends object ? request extends viem.ExactPartial<T_20> ? T_20 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) ? T_16 extends string ? T_16 : undefined : never : never) | undefined>> extends true ? unknown : viem.ExactPartial<viem.ExtractFormattedTransactionRequest<viem.DeriveChain<Chain, chainOverride>, {
        type?: ((request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_21 ? T_21 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_21 extends object ? request extends viem.ExactPartial<T_21> ? T_21 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_22 ? T_22 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_22 extends object ? request extends viem.ExactPartial<T_22> ? T_22 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_23 ? T_23 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_23 extends object ? request extends viem.ExactPartial<T_23> ? T_23 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_24 ? T_24 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_24 extends object ? request extends viem.ExactPartial<T_24> ? T_24 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) extends infer T_25 ? T_25 extends (request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_26 ? T_26 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_26 extends object ? request extends viem.ExactPartial<T_26> ? T_26 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_27 ? T_27 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_27 extends object ? request extends viem.ExactPartial<T_27> ? T_27 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_28 ? T_28 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_28 extends object ? request extends viem.ExactPartial<T_28> ? T_28 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_29 ? T_29 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_29 extends object ? request extends viem.ExactPartial<T_29> ? T_29 extends {
            type?: infer type | undefined;
        } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
            accessList?: undefined | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } & (viem.OneOf<{
            maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, viem.FeeValuesEIP1559> & {
            accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: bigint | undefined;
            sidecars?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: undefined | undefined;
            maxPriorityFeePerGas?: undefined | undefined;
        } & {
            accessList: viem.TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: undefined | undefined;
            blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
            blobVersionedHashes?: readonly `0x${string}`[] | undefined;
            maxFeePerBlobGas?: bigint | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
        }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
            blobs: viem.TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: viem.TransactionSerializableEIP4844["sidecars"];
        }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        } | {
            accessList?: viem.AccessList | undefined;
            authorizationList?: viem.SignedAuthorizationList | undefined;
            blobs?: undefined | undefined;
            blobVersionedHashes?: undefined | undefined;
            gasPrice?: undefined | undefined;
            maxFeePerBlobGas?: undefined | undefined;
            maxFeePerGas?: bigint | undefined;
            maxPriorityFeePerGas?: bigint | undefined;
            sidecars?: undefined | undefined;
        }) & {
            authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) ? T_25 extends string ? T_25 : undefined : never : never) | undefined;
    }, viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from">, ((request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_30 ? T_30 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_30 extends object ? request extends viem.ExactPartial<T_30> ? T_30 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_31 ? T_31 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_31 extends object ? request extends viem.ExactPartial<T_31> ? T_31 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_32 ? T_32 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_32 extends object ? request extends viem.ExactPartial<T_32> ? T_32 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_33 ? T_33 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_33 extends object ? request extends viem.ExactPartial<T_33> ? T_33 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) extends infer T_34 ? T_34 extends (request["type"] extends string ? request["type"] : viem.IsNever<viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_35 ? T_35 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_35 extends object ? request extends viem.ExactPartial<T_35> ? T_35 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_36 ? T_36 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_36 extends object ? request extends viem.ExactPartial<T_36> ? T_36 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never> extends false ? viem.IsNever<Extract<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_37 ? T_37 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_37 extends object ? request extends viem.ExactPartial<T_37> ? T_37 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>>> extends true ? Exclude<viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> extends infer T_38 ? T_38 extends viem.UnionOmit<viem.ExtractChainFormatterParameters<viem.DeriveChain<Chain, chainOverride>, "transactionRequest", viem.TransactionRequest>, "from"> ? T_38 extends object ? request extends viem.ExactPartial<T_38> ? T_38 extends {
        type?: infer type | undefined;
    } ? Extract<type, string> : never : never : never : never : never, NonNullable<"legacy" | "eip2930" | "eip1559" | "eip4844" | "eip7702" | undefined>> : never : request["type"] extends string | undefined ? request["type"] : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : viem.GetTransactionType<request, (request extends {
        accessList?: undefined | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & viem.FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } & (viem.OneOf<{
        maxFeePerGas: viem.FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: viem.FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, viem.FeeValuesEIP1559> & {
        accessList?: viem.TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: bigint | undefined;
        sidecars?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: undefined | undefined;
        maxPriorityFeePerGas?: undefined | undefined;
    } & {
        accessList: viem.TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: undefined | undefined;
        blobs?: readonly `0x${string}`[] | readonly viem.ByteArray[] | undefined;
        blobVersionedHashes?: readonly `0x${string}`[] | undefined;
        maxFeePerBlobGas?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: false | readonly viem.BlobSidecar<`0x${string}`>[] | undefined;
    }) & (viem.ExactPartial<viem.FeeValuesEIP4844> & viem.OneOf<{
        blobs: viem.TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: viem.TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: viem.TransactionSerializableEIP4844["sidecars"];
    }, viem.TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    } | {
        accessList?: viem.AccessList | undefined;
        authorizationList?: viem.SignedAuthorizationList | undefined;
        blobs?: undefined | undefined;
        blobVersionedHashes?: undefined | undefined;
        gasPrice?: undefined | undefined;
        maxFeePerBlobGas?: undefined | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
        sidecars?: undefined | undefined;
    }) & {
        authorizationList: viem.TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string | undefined ? Extract<request["type"], string> : never)>) ? T_34 extends string ? T_34 : undefined : never : never) | undefined>>> & {
        chainId?: number | undefined;
    }, (request["parameters"] extends readonly viem.PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "fees" | "gas" | "nonce" | "blobVersionedHashes" | "chainId" | "type") extends infer T_39 ? T_39 extends (request["parameters"] extends readonly viem.PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "fees" | "gas" | "nonce" | "blobVersionedHashes" | "chainId" | "type") ? T_39 extends "fees" ? "gasPrice" | "maxFeePerGas" | "maxPriorityFeePerGas" : T_39 : never : never> & (unknown extends request["kzg"] ? {} : Pick<request, "kzg">) & {
        _capabilities?: {
            [x: string]: any;
        } | undefined;
    } extends infer T ? { [K in keyof T]: T[K]; } : never>;
    readContract: <const abi extends viem.Abi | readonly unknown[], functionName extends viem.ContractFunctionName<abi, "pure" | "view">, const args extends viem.ContractFunctionArgs<abi, "pure" | "view", functionName>>(args: viem.ReadContractParameters<abi, functionName, args>) => Promise<viem.ReadContractReturnType<abi, functionName, args>>;
    sendRawTransaction: (args: viem.SendRawTransactionParameters) => Promise<viem.SendRawTransactionReturnType>;
    sendRawTransactionSync: (args: viem.SendRawTransactionSyncParameters) => Promise<viem.TransactionReceipt>;
    simulate: <const calls extends readonly unknown[]>(args: viem.SimulateBlocksParameters<calls>) => Promise<viem.SimulateBlocksReturnType<calls>>;
    simulateBlocks: <const calls extends readonly unknown[]>(args: viem.SimulateBlocksParameters<calls>) => Promise<viem.SimulateBlocksReturnType<calls>>;
    simulateCalls: <const calls extends readonly unknown[]>(args: viem.SimulateCallsParameters<calls>) => Promise<viem.SimulateCallsReturnType<calls>>;
    simulateContract: <const abi extends viem.Abi | readonly unknown[], functionName extends viem.ContractFunctionName<abi, "nonpayable" | "payable">, const args_1 extends viem.ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainOverride extends Chain | undefined, accountOverride extends viem.Account | viem.Address | undefined = undefined>(args: viem.SimulateContractParameters<abi, functionName, args_1, Chain, chainOverride, accountOverride>) => Promise<viem.SimulateContractReturnType<abi, functionName, args_1, Chain, undefined, chainOverride, accountOverride>>;
    verifyHash: (args: viem.VerifyHashActionParameters) => Promise<viem.VerifyHashActionReturnType>;
    verifyMessage: (args: viem.VerifyMessageActionParameters) => Promise<viem.VerifyMessageActionReturnType>;
    verifySiweMessage: (args: viem__types_actions_siwe_verifySiweMessage.VerifySiweMessageParameters) => Promise<viem__types_actions_siwe_verifySiweMessage.VerifySiweMessageReturnType>;
    verifyTypedData: (args: viem.VerifyTypedDataActionParameters) => Promise<viem.VerifyTypedDataActionReturnType>;
    uninstallFilter: (args: viem.UninstallFilterParameters) => Promise<viem.UninstallFilterReturnType>;
    waitForTransactionReceipt: (args: viem.WaitForTransactionReceiptParameters<Chain>) => Promise<viem.TransactionReceipt>;
    watchBlockNumber: (args: viem.WatchBlockNumberParameters) => viem.WatchBlockNumberReturnType;
    watchBlockHeaders: (args: never) => viem.WatchBlockHeadersReturnType;
    watchBlocks: <includeTransactions extends boolean = false, blockTag extends viem.BlockTag = "latest">(args: viem.WatchBlocksParameters<viem.HttpTransport<undefined, false>, Chain, includeTransactions, blockTag>) => viem.WatchBlocksReturnType;
    watchContractEvent: <const abi extends viem.Abi | readonly unknown[], eventName extends viem.ContractEventName<abi>, strict extends boolean | undefined = undefined>(args: viem.WatchContractEventParameters<abi, eventName, strict, viem.HttpTransport<undefined, false>>) => viem.WatchContractEventReturnType;
    watchEvent: <const abiEvent extends viem.AbiEvent | undefined = undefined, const abiEvents extends readonly viem.AbiEvent[] | readonly unknown[] | undefined = abiEvent extends viem.AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined>(args: viem.WatchEventParameters<abiEvent, abiEvents, strict, viem.HttpTransport<undefined, false>>) => viem.WatchEventReturnType;
    watchPendingTransactions: (args: viem.WatchPendingTransactionsParameters<viem.HttpTransport<undefined, false>>) => viem.WatchPendingTransactionsReturnType;
    token: {
        getAllowance: ((parameters: viem__types_actions_token.getAllowance.Parameters<Chain, undefined>) => Promise<viem__types_actions_token.getAllowance.ReturnValue>) & {
            call: (args: viem__types_actions_token.getAllowance.Args<Chain, undefined>) => ReturnType<typeof viem__types_actions_token.getAllowance.call>;
        };
        getBalance: ((parameters: viem__types_actions_token.getBalance.Parameters<Chain, undefined, undefined>) => Promise<viem__types_actions_token.getBalance.ReturnValue>) & {
            call: (args: viem__types_actions_token.getBalance.Args<Chain, undefined, undefined>) => ReturnType<typeof viem__types_actions_token.getBalance.call>;
        };
        getMetadata: (parameters: viem__types_actions_token.getMetadata.Parameters<Chain, undefined>) => Promise<viem__types_actions_token.getMetadata.ReturnValue>;
        getTotalSupply: ((parameters: viem__types_actions_token.getTotalSupply.Parameters<Chain, undefined>) => Promise<viem__types_actions_token.getTotalSupply.ReturnValue>) & {
            call: (args: viem__types_actions_token.getTotalSupply.Args<Chain, undefined>) => ReturnType<typeof viem__types_actions_token.getTotalSupply.call>;
        };
    };
    extend: <const client extends {
        [x: string]: unknown;
        account?: undefined;
        batch?: undefined;
        cacheTime?: undefined;
        ccipRead?: undefined;
        chain?: undefined;
        dataSuffix?: undefined;
        experimental_blockTag?: undefined;
        key?: undefined;
        name?: undefined;
        pollingInterval?: undefined;
        request?: undefined;
        tokens?: undefined;
        transport?: undefined;
        type?: undefined;
        uid?: undefined;
    } & viem.ExactPartial<Pick<viem.PublicActions<viem.HttpTransport<undefined, false>, Chain, undefined, undefined>, "prepareTransactionRequest" | "call" | "createContractEventFilter" | "createEventFilter" | "estimateContractGas" | "estimateGas" | "getBlock" | "getBlockNumber" | "getChainId" | "getContractEvents" | "getEnsText" | "getFilterChanges" | "getGasPrice" | "getLogs" | "getTransaction" | "getTransactionCount" | "getTransactionReceipt" | "readContract" | "sendRawTransaction" | "simulateContract" | "uninstallFilter" | "watchBlockNumber" | "watchContractEvent"> & Pick<viem.WalletActions<Chain, undefined, undefined>, "sendTransaction" | "writeContract">>>(fn: (client: viem.Client<viem.HttpTransport<undefined, false>, Chain, undefined, viem.PublicRpcSchema, viem.PublicActions<viem.HttpTransport<undefined, false>, Chain, undefined, undefined>, undefined>) => client) => viem.Client<viem.HttpTransport<undefined, false>, Chain, undefined, viem.PublicRpcSchema, { [K in keyof client]: client[K]; } & viem.PublicActions<viem.HttpTransport<undefined, false>, Chain, undefined, undefined>, undefined>;
};

export { createAnchorProvider, createEvmClient, loadProgram };
