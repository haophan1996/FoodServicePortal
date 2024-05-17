


SELECT * FROM get_order_details('2024-04-26');


-- Create function get detail
CREATE OR REPLACE FUNCTION get_order_details(p_order_date DATE) RETURNS JSON AS 
$$
DECLARE
	result JSON;
BEGIN
	SELECT json_agg(
	        json_build_object(
	            'orid', subquery.orid, 
                'cusid', subquery.cusid, 
                'cus_name', subquery.cusname, 
                'ordate', subquery.ordate, 
                'orpickup', subquery.orpickup, 
                'ispickup', subquery.ispickup, 
                'total_price', subquery.total_price, 
                'details', subquery.order_details
	        )
	    ) INTO result
	FROM (
	        SELECT
	            o.orid, 
                c.cusname,
                o.orpickup, 
                c.cusid, 
                o.ordate, 
                o.ispickup, 
                SUM(d.firm_price * d.detailquality + COALESCE(dt.toppings_price, 0)) as total_price, 
                json_agg(json_build_object(
	                    'detailid', d.detailid, 
                        'or_id', o.orid, 
                        'item_id', i.itemid, 
                        'item_name', i.itemname, 
                        'cag_id', cag.cagid, 
                        'cag_name', cag.cagname, 
                        'detailnote', d.detailnote, 
                        'detailquality', d.detailquality,
                        'firm_price', d.firm_price, 
                        'toppings', COALESCE(dt.toppings, '[]'::json)
	                )
	                ORDER BY cag.cagname ASC
	            ) AS order_details
	        FROM
	            orders o
	            INNER JOIN customer c ON o.cus_id = c.cusid
	            INNER JOIN detail d ON o.orid = d.or_id
	            INNER JOIN item i ON d.item_id = i.itemid
	            INNER JOIN category cag ON cag.cagid = i.cag_id
	            LEFT JOIN LATERAL (
	                SELECT 
                        json_agg(json_build_object(
                            'detailtopid', dt.detailtopid, 
                            'detail_id', dt.detail_id, 
                            'top_id', t.topid, 
                            'top_name', t.topname, 
                            'topprice', dt.topprice, 
                            'topquality', dt.topquality
                            ) ORDER BY dt.detailtopid ASC ) AS toppings, 
                        SUM(dt.topprice * dt.topquality) as toppings_price
	                FROM detail_topping dt
	                    JOIN topping t ON dt.top_id = t.topid
	                WHERE
	                    dt.detail_id = d.detailid
	            ) AS dt ON true
	        WHERE
	            o.ordate = COALESCE(p_order_date, o.ordate) -- Filter by date if provided
	        GROUP BY
	            o.orid, c.cusid, o.ordate
	    ) AS subquery;
	RETURN result;
END;
$$
LANGUAGE
plpgsql; 