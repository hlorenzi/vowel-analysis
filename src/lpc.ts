export function forwardLinearPrediction(
    sample: Float32Array,
    numCoeffs: number)
{
    // INITIALIZE R WITH AUTOCORRELATION COEFFICIENTS
    const r = new Array(numCoeffs + 1).fill(0)
    for (let i = 0; i <= numCoeffs; i++)
    {
        for (let j = 0; j <= sample.length - 1 - i; j++)
        {
            r[i] += sample[j] * sample[j + i]
        }
    }

    // INITIALIZE Ak
    const ak = new Array(numCoeffs + 1).fill(0)
    ak[0] = 1

    // INITIALIZE Ek
    let ek = r[0]

    // LEVINSON-DURBIN RECURSION
    for (let k = 0; k < numCoeffs; k++)
    {
        // COMPUTE LAMBDA
        let lambda = 0
        for (let j = 0; j <= k; j++)
        {
            lambda -= ak[j] * r[k + 1 - j]
        }

        lambda /= ek
        
        // UPDATE Ak
        for (let i = 0; i <= (k + 1) / 2; i++)
        {
            const temp = ak[k + 1 - i] + lambda * ak[i]
            ak[i] = ak[i] + lambda * ak[k + 1 - i]
            ak[k + 1 - i] = temp
        }

        // UPDATE Ek
        ek *= 1 - lambda * lambda
    }

    // ASSIGN COEFFICIENTS
    return ak
}


/*void ForwardLinearPrediction( vector<double> &coeffs, const vector<double> &x )
{
    // GET SIZE FROM INPUT VECTORS
    size_t N = x.size() - 1;
    size_t m = coeffs.size();
    
    // INITIALIZE R WITH AUTOCORRELATION COEFFICIENTS
    vector<double> R( m + 1, 0.0 );
    for ( size_t i = 0; i <= m; i++ )
    {
        for ( size_t j = 0; j <= N - i; j++ )
        {
            R[ i ] += x[ j ] * x[ j + i ];
        }
    }
    
    // INITIALIZE Ak
    vector<double> Ak( m + 1, 0.0 );
    Ak[ 0 ] = 1.0;
    
    // INITIALIZE Ek
    double Ek = R[ 0 ];
    
    // LEVINSON-DURBIN RECURSION
    for ( size_t k = 0; k < m; k++ )
    {
        // COMPUTE LAMBDA
        double lambda = 0.0;
        for ( size_t j = 0; j <= k; j++ )
        {
            lambda -= Ak[ j ] * R[ k + 1 - j ];
        }
        
        lambda /= Ek;
        
        // UPDATE Ak
        for ( size_t n = 0; n <= ( k + 1 ) / 2; n++ )
        {
            double temp = Ak[ k + 1 - n ] + lambda * Ak[ n ];
            Ak[ n ] = Ak[ n ] + lambda * Ak[ k + 1 - n ];
            Ak[ k + 1 - n ] = temp;
        }
        
        // UPDATE Ek
        Ek *= 1.0 - lambda * lambda;
    }
    
    // ASSIGN COEFFICIENTS
    coeffs.assign( ++Ak.begin(), Ak.end() );
}

int main()
{
    vector<double> original( 128, 0.0 );
    for ( size_t i = 0; i < original.size(); i++ ){
        original[ i ] = sin( i * 0.01 ) + 0.75 * sin( i * 0.03 )+ 0.5 * sin( i * 0.05 ) + 0.25 * sin( i * 0.11 );
        
    } 
    for ( int i = 0; i < 128; i++ ){
        printf( "Original: %.2d = %.6f\n", i, original[ i ] );
    }
    // GET FORWARD LINEAR PREDICTION COEFFICIENTS
    vector<double> coeffs( 4, 0.0 );
    ForwardLinearPrediction( coeffs, original ); 
    
    // PREDICT DATA LINEARLY
    vector<double> predicted( original );
    size_t m = coeffs.size();
    for ( size_t i = m; i < predicted.size(); i++ ){
        predicted[ i ] = 0.0;
        for ( size_t j = 0; j < m; j++ ){
            predicted[ i ] -= coeffs[ j ] * original[ i - 1 - j ];
            
        }
        
    } 
    // CALCULATE AND DISPLAY ERROR
    double error = 0.0;
    for ( int i = m; i < predicted.size(); i++ ){
        //printf( "Index: %.2d / Original: %.6f / Predicted: %.6f\n", i, original[ i ], predicted[ i ] );
        double delta = predicted[ i ] - original[ i ];
        error += delta * delta;
        
    }
    printf( "Forward Linear Prediction Approximation Error: %f\n", error);
    
    for ( int i = 0; i < coeffs.size(); i++ ){
        printf( "Coeff: %.2d = %.6f\n", i, coeffs[ i ] );
    }
    
    return 0;
}
*/