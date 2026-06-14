import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
async def parse_pipeline(request: Request):
    # Expecting form data containing 'pipeline' as a JSON string
    # Or just reading JSON directly if the frontend sends JSON body.
    try:
        form = await request.form()
        pipeline_str = form.get('pipeline')
        if pipeline_str:
            data = json.loads(pipeline_str)
        else:
            # fallback to direct json body
            data = await request.json()
    except:
        data = await request.json()

    nodes = data.get('nodes', [])
    edges = data.get('edges', [])
    
    num_nodes = len(nodes)
    num_edges = len(edges)
    
    # Check if DAG using DFS
    adj_list = defaultdict(list)
    for edge in edges:
        adj_list[edge['source']].append(edge['target'])
    
    # 0 = unvisited, 1 = visiting, 2 = visited
    visited = {}
    is_dag = True
    
    def dfs(node_id):
        nonlocal is_dag
        if not is_dag: return
        
        state = visited.get(node_id, 0)
        if state == 1:
            is_dag = False
            return
        if state == 2:
            return
            
        visited[node_id] = 1
        for neighbor in adj_list[node_id]:
            dfs(neighbor)
        visited[node_id] = 2

    for node in nodes:
        if node['id'] not in visited:
            dfs(node['id'])

    return {'num_nodes': num_nodes, 'num_edges': num_edges, 'is_dag': is_dag}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
